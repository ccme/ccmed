
Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("Messages", function () {
  return Messages.find(
    {$or: [{"public": true}, {invited: this.userId}, {owner: this.userId}]});
});
