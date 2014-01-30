Template.footer.usercount = function() {
	return Meteor.users.find().count();
};
Template.footer.usercountonline = function() {
	return Meteor.users.find({
		"status.online": true
	}).count();
};