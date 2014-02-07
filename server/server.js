// Start up server processes.  

// SMTP
// The dir /private becomes assets/app when meteor builds the site.  This tells Haraka to use that directory as it's base dir.
process.env.HARAKA = process.cwd() + '/assets/app';
//console.log("ENV:", process.env.HARAKA);
var Haraka = Meteor.require('Haraka');
var MailParser = Meteor.require("mailparser").MailParser;
var forge = Meteor.require('node-forge');

// This is a simple server that get mail and stores it in the Meteor DB
var fs = Meteor.require('fs');
net = Meteor.require('net'), 
mailsocket_port = '/tmp/ccmed.sock';

try { fs.unlinkSync(mailsocket_port); } catch (err) { }

mailsocket = net.createServer( Meteor.bindEnvironment(function(connection) { 
	var complete_msg = '';
	// reporting 
	console.log('Subscriber connected.'); 
	connection.write("Simple JSON store. Tell me your woes and I will record them.\n"); // watcher setup 
	// cleanup 
	connection.on('data', function(data) { 
		complete_msg += data.toString();
		console.log('Got some data');
	}); 
	connection.on('close', Meteor.bindEnvironment(function() { 
		console.log('Subscriber disconnected.'); 
		// Get past "HEADER:"
		var h = complete_msg.indexOf('\n');
		var msg = JSON.parse(complete_msg.substring(7,h));
		msg.received = Date.now();
		msg.mime = complete_msg.substring(h+1);
		DecryptMsg(msg);
//		console.log('data:',msg); 
		var docid = Messages.insert( msg );
		console.log('Inserted:',docid);
	})); 
})); 

mailsocket.listen( mailsocket_port, function() { 
	console.log('Listening for subscribers on (%s)...',mailsocket_port); 
});

var testccmekey = "-----BEGIN RSA PRIVATE KEY-----\
MIIEogIBAAKCAQEAl8vZSCtuUzAzHhx/4DKmKImzs+QeFFPT3J9/BlpON7Y0pB+E\
Z3YDzyes5/2zcu/VaseKGMOo9uHp0KtZd7r/wVI2BTNCXTKtMMwcl/KGx+77pEZK\
ac45N3iE1Tx8vIxdFfGbsVONxG/cR6B316xUW5z/Wi3Fyu6K7K5UR3VxxjBmAszc\
K6BbJRO4xW00IbK0r6XdSzAWq/jHmhKXBne32QxWpFEvr9CmwS34TcM4pY/huid4\
uaQeT92aDMt/RTVe59Zaoh7hRcIuy4ZK23XAD3fBz6AF+PkanHUxyjuxLlNKCStu\
odRIFUx7n9IFIVk3qZzkLiCcVr5JKSEFtwwBLwIDAQABAoIBABdsdGYHlamumWS/\
Hxh4mF1PCnTq8Z1PZjT4Q8C2NLWyHyNoXaUdd+8Cf1L5OjS1P6iPjAbQQoV+TPdP\
SaoJKCgryHw68bWx+Tm7dXoZCaVWgmxSEG+NTBT8Ovswr0rlGgQl2VGexBSY8lP3\
NicIx6evbVP8FjZ/Yt6s9AJm5Byh5HIIDexb8PdbrxogM3dD+WqQ7+ZhJURquMlr\
VijIszVtCpih/mJacewsi+/4yr/oNGj7T0Iuzokcb3gCwbVbfYVFGX98zS5DB+2/\
9n+lK65xoGsn/8JYOM2xHqJnN28cho3B2PwXQaRNEdUs0PohrdqPpwYvSENfGm7a\
w9REoPECgYEAySZBrZBg4MDcPKU7GgY04DQAmvAl9XkKeqYUpZmeHomtVjkTfwWJ\
rm1s18Vg6Hrid9ZpHLmfYyzkH7gTBU08ivwkJnYFgB7M6jB1ToR1om1UHPk43swX\
KXJ9MkuERbJOjsg3svDQTygcF7gpmeNPSotiv3Zb3aZZWcDDDy9t82kCgYEAwTBe\
7zW3laWjCD5JTMYsH+emtzJiW5WA8G1RkNL4VIdicZsYQBXQsj4S42loF38TRNnA\
bdV9SH3nKUOtuaFeMB7DkzYXL4KJ4aI7oif5unaKcoTUsErUWD6Z/8Kcvjo6gbu2\
74K8Sj8C0l5qHg+5EufdgT6VOCD7QR9H2LwBdNcCgYBrVOiSzomDJCXgjmI8/rbU\
M6tnAWGf3FiFHX3C53eB4AEIEyieDLxswKLld8LACmIxg81OsJWl+9w2OKidmZsG\
pog7pZpFxSmehQDzRqbmZuQNGccIy2pIiXjYj4cjEYPtmFRwPSNKOaLT3UcFgE9c\
/YdRlrxqR0tCIyNyROKskQKBgFQvjv8w6mqE/rGl6u1Q4oOYwBbPFvuP/9tF2CiD\
NwIm6ShWjM/IceRqlnKRSXILx0rWlTuHsAu6CdT6kCb3ggL4NQPeq2XhvdIcj14P\
i4zNAXH8Hm8gfL5jsVo55XIkD8DfG03uK70zDji8OgQVl/H8JpOewQnvnW34gqeY\
7g2LAoGAZb0RrQlS4nXYc2ugYT+7HhWHdUjJSL9L5B3dJDN8pSluMbpm6uOfgvEc\
Q7T3msW0w4HV9DzdJIuJOij9msXoS1k2heujs9z+g4Q/PILi8vB1tWTWV5HpEt/r\
H4BE8lXZS1XCVWsGBao54KMqLfC5CiNM8440VatChkAfoO2iag0=\
-----END RSA PRIVATE KEY-----\
";

Fiber      = Meteor.require('fibers');

var DecryptMsg = function(msg) {

    mailparser = new MailParser();

    var fiber = Fiber.current;

	mailparser.on("end", function(mail_object){
	//    console.log("Details:", JSON.stringify(mail_object,null,3));

		if (mail_object.text) 
			console.log('Message:',mail_object.text);

		var pem = mail_object.attachments[0].content;

		var s = pem.toString('base64');
		var str = forge.util.decode64(s);
		var o = forge.asn1.fromDer(str);
		var p7 = forge.pkcs7.messageFromAsn1(o);

		// Get private key
		var privateKey_pem = testccmekey;
		var privateKey = forge.pki.privateKeyFromPem(privateKey_pem);

		// decrypt
		var t = p7.decrypt(p7.recipients[0], privateKey);
		msg.signed_msg = p7.content.data;
	//	console.log("details:",msg);

		var mparser = new MailParser();
		mparser.on("end", function(msgbody) {
			if (msgbody.text) {
				console.log("Message:",msgbody.text);
				msg.body = msgbody.text;
				msgbody.attachments.forEach(function (sig) {
					if (sig.contentType==="application/pkcs7-signature") {
						var msgtxt = msgbody.text;
						// we have a signature.
						var s = sig.content.toString('base64');
						console.log('Signature:',s);
						var str = forge.util.decode64(s);
						var o = forge.asn1.fromDer(str);
						var p7 = forge.pkcs7.messageFromAsn1(o);

						var md1 = forge.md.sha1.create();
						md1.update(msgtxt);
						var digest = md1.digest().toHex();
						console.log('Digest:',digest);
					}
				}); 
			}
	    	fiber.run();
		});
		mparser.write(msg.signed_msg);
		mparser.end();
	});

	mailparser.write(msg.mime);
	mailparser.end();

    var res = Fiber.yield();


	return;
};

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

Meteor.publish("ServerSettings", function() {
    return ServerSettings.find();
});

Meteor.publish("Users", function() {
    return Meteor.users.find();
});

Meteor.methods({
  update_setting: function (type, name, value) {
    check(type, String);
    check(name, String);
    check(value, String);

    var obj = {};
    obj[name] = value;

    var result = ServerSettings.findOne({'type': type}, {'setting': obj });

    console.log({'type': type}, {'setting': obj });

    ServerSettings.update({
     'type': type
    }, {
      'setting': obj
    }, function(error, affectedDocs) {
      if (error) {
        throw new Meteor.Error(500, error.message);
      } else {
        return "Update Successful";
      }
    });
  }
});