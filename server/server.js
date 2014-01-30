// Start up server processes.  

// SMTP
// The dir /private becomes assets/app when meteor builds the site.  This tells Haraka to use that directory as it's base dir.
process.env.HARAKA = process.cwd() + '/assets/app';
console.log("ENV:", process.env.HARAKA);

var Haraka = Meteor.require('Haraka');

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