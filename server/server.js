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
	// reporting 
	console.log('Subscriber connected.'); 
	connection.write("Simple MIME Poster.\n"); // watcher setup 
	// cleanup 
	connection.on('data', Meteor.bindEnvironment(function(data) { 
//		console.log('data:',data.toString()); 
		var docid = Messages.insert(data.toString());
		console.log('Inserted:',docid);
	})); 
	connection.on('close', function() { 
		console.log('Subscriber disconnected.'); 
	}); 
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
    return Messages.find({
        $or: [{
            "public": true
        }, {
            invited: this.userId
        }, {
            owner: this.userId
        }]
    });
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
