// Start up server processes.  

// SMTP
// The dir /private becomes assets/app when meteor builds the site.  This tells Haraka to use that directory as it's base dir.
process.env.HARAKA = process.cwd() + '/assets/app';
//console.log("ENV:", process.env.HARAKA);
var Haraka = Meteor.require('Haraka');

// This is a simple server that get mail and stores it in the Meteor DB
var fs = Meteor.require('fs');
net = Meteor.require('net'), 
mailsocket_port = '/tmp/ccmed.sock';

try { fs.unlinkSync(mailsocket_port); } catch (err) { }
mailsocket = net.createServer( Meteor.bindEnvironment(function(connection) { 
	var complete_msg = '';
	// reporting 
	debugger;
	console.log('Subscriber connected.'); 
	connection.write("Simple JSON store. Tell me your woes and I will record them.\n"); // watcher setup 
	// cleanup 
	connection.on('data', function(data) { 
		complete_msg += data.toString();
		console.log('Got some data');
	}); 
	connection.on('close', Meteor.bindEnvironment(function() { 
		console.log('Subscriber disconnected.'); 
		var msg = JSON.parse(complete_msg);
//		console.log('data:',msg); 
		var docid = Messages.insert( msg );
		console.log('Inserted:',docid);
	})); 
})); 
mailsocket.listen( mailsocket_port, function() { 
	console.log('Listening for subscribers on (%s)...',mailsocket_port); 
});


// DNS

// LDAP

// IMAP (future)


Meteor.publish("directory", function() {
    return Meteor.users.find({}, {
        fields: {
            emails: 1,
            profile: 1
        }
    });
});

Meteor.publish("Messages", function() {
    return Messages.find();
});

/* TODO: Remove ability for users to change profile.admin */
Meteor.users.allow({
    update: function(userId, user, fields, modifier) {
        if (user._id === userId) {
            Meteor.users.update({
                _id: userId
            }, modifier);
            return true;
        } else return false;
    }
});
Meteor.publish("userStatus", function() {
    return Meteor.users.find({
        "status.online": true
    }, {
        fields: {}
    });
});
