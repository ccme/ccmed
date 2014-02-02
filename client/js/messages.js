/* TODO: Display messages from mongo collection */

Meteor.subscribe('Messages');

Template.messages.helpers({
    message: function() {
        return Messages.find();
    }
});
