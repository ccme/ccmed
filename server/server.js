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
var os = Meteor.require('os');

net = Meteor.require('net'),
mailsocket_port = '/tmp/ccmed.sock';

try {
    fs.unlinkSync(mailsocket_port);
} catch (err) {}

mailsocket = net.createServer(Meteor.bindEnvironment(function(connection) {
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
        var msg = JSON.parse(complete_msg.substring(7, h));
        msg.received = Date.now();
        msg.mime = complete_msg.substring(h + 1);
        var mailFrom = msg.rcpt_to[0].user + '@' + msg.rcpt_to[0].host;
        var privKey = getUserPrivate(mailFrom);
        if (privKey == '') {
            console.log('User or private key doesn\'t exist.');
            //We need to reject this message.
        }
        debugger;
        DecryptMsg(msg, privKey);
        //      console.log('data:',msg); 
        var docid = Messages.insert(msg);
        console.log('Inserted:', docid);
    }));
}));

mailsocket.listen(mailsocket_port, function() {
    console.log('Listening for subscribers on (%s)...', mailsocket_port);
});

Fiber = Meteor.require('fibers');

var DecryptMsg = function(msg, privKey) {

    mailparser = new MailParser();

    var fiber = Fiber.current;

    mailparser.on("end", function(mail_object) {
        //    console.log("Details:", JSON.stringify(mail_object,null,3));


        if ((mail_object.attachments === undefined) || (mail_object.attachments[0].contentType != "application/pkcs7-mime")) {
            if (mail_object.text) { // this is not an encrypted message.
                msg.body = mail_object.text;
            }
            fiber.run();
            return;
        }

        var pem = mail_object.attachments[0].content;

        var s = pem.toString('base64');
        var str = forge.util.decode64(s);
        var o = forge.asn1.fromDer(str);
        var p7 = forge.pkcs7.messageFromAsn1(o);

        // Get private key
        var privateKey = forge.pki.privateKeyFromPem(privKey);

        // decrypt
        var t = p7.decrypt(p7.recipients[0], privateKey);
        msg.signed_msg = p7.content.data;
        //  console.log("details:",msg);

        var mparser = new MailParser();
        mparser.on("end", function(msgbody) {
            if (msgbody.text) {
                //              console.log("Message:",msgbody.text);
                msg.body = msgbody.text;
                msgbody.attachments.forEach(function(sig) {
                    if (sig.contentType === "application/pkcs7-signature") {
                        var msgtxt = msgbody.text;
                        // we have a signature.
                        var s = sig.content.toString('base64');
                        console.log('Signature:', s);
                        var str = forge.util.decode64(s);
                        var o = forge.asn1.fromDer(str);
                        var p7 = forge.pkcs7.messageFromAsn1(o);

                        var md1 = forge.md.sha1.create();
                        md1.update(msgtxt);
                        var digest = md1.digest().toHex();
                        console.log('Digest:', digest);
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

function getUserPrivate(email) {
    try {
        var privKey = Meteor.users.findOne({
            'emails.0.address': email
        }).private_key;
        return privKey;
    } catch (err) {
        return '';
    }
}

function getUserPublic(email) {
    try {
        var pubKey = Meteor.users.findOne({
            'emails.0.address': email
        }).public_key;
        return pubKey;
    } catch (err) {
        return '';
    }
}

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

Meteor.publish("Server", function() {
    return Server.find();
});

Meteor.publish("Users", function() {
    return Meteor.users.find();
});

Meteor.methods({
    update_setting: function(type, name, value) {
        check(type, String);
        check(name, String);
        check(value, String);

        var obj = {};
        obj[name] = value;

        var result = Server.findOne({
            'type': type
        }, {
            'setting': obj
        });

        console.log({
            'type': type
        }, {
            'setting': obj
        });

        Server.update({
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
    },
    update_email_keys: function(email, private_key, public_key, dob) {
        check(email, String);
        check(private_key, String);
        check(public_key, String);
        Meteor.users.update({
            _id: this.userId,
            'emails.address': email
        }, {
            $set: {
                "emails.$.private_key": private_key,
                "emails.$.public_key": public_key
            }

        }, function(error, affectedDocs) {
            if (error) {
                throw new Meteor.Error(500, error.message);
            } else {
                return "Update Successful";
            }
        });

        debugger;
    }
});

var started = Date.now();

Meteor.startup(function() {
    Server.insert({
        'os': {
            'cpu': {
                'count': '',
                'free': '',
                'user': '',
                'sys': ''
            },
            'memory': {
                'free': bytesToSize(os.freemem()),
                'total': bytesToSize(os.totalmem())
            },
            'network': {
                'hostname': os.hostname(),
                'interfaces': os.networkInterfaces()
            },
            'system_info': {
                'started': started,
                'uptime': os.uptime(),
                'release': os.release(),
                'arch': os.arch()
            }
        }
    });
});

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
system_stats_loop = Meteor.setInterval(function() {
    var cpu = os.cpus();

    var counter = 0;
    var total = 0;

    var free = 0;
    var sys = 0;
    var user = 0;
    for (var i = 0; i < cpu.length; i++) {

        counter++;
        total = parseFloat(cpu[i].times.idle) + parseFloat(cpu[i].times.sys) + parseFloat(cpu[i].times.user) + parseFloat(cpu[i].times.irq) + parseFloat(cpu[i].times.nice);

        free += 100 * (parseFloat(cpu[i].times.idle) / total);
        sys += 100 * (parseFloat(cpu[i].times.sys) / total);
        user += 100 * (parseFloat(cpu[i].times.user) / total);
    };

    //console.log('%s CPUS - Free %s + User: %s + System: %s', i, (free / counter).toFixed(2), (user / counter).toFixed(2), (sys / counter).toFixed(2));
    debugger;
    Server.update({}, {
        $set: {
            'os': {
                'cpu': {
                    'count': i,
                    'free': (free / counter).toFixed(2),
                    'user': (user / counter).toFixed(2),
                    'sys': (sys / counter).toFixed(2)
                },
                'memory': {
                    'free': bytesToSize(os.freemem()),
                    'total': bytesToSize(os.totalmem())
                },
                'network': {
                    'hostname': os.hostname(),
                    'interfaces': os.networkInterfaces()
                },
                'system_info': {
                    'started': started,
                    'uptime': os.uptime(),
                    'release': os.release(),
                    'arch': os.arch()
                }
            }
        }
    });
}, 1000);
