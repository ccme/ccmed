

// Start up server processes.  

// SMTP
// The dir /private becomes assets/app when meteor builds the site.  This tells Haraka to use that directory as it's base dir.
process.env.HARAKA=process.cwd()+'/assets/app';
console.log("ENV:",process.env.HARAKA);

var Haraka = Meteor.require('Haraka');

// DNS

// LDAP

// IMAP (future)


Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("Messages", function () {
  return Messages.find(
    {$or: [{"public": true}, {invited: this.userId}, {owner: this.userId}]});
});



