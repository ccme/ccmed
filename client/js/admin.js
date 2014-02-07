Meteor.subscribe('ServerSettings');
Meteor.subscribe('Users');

Template.adminstart.helpers({
    domain_name: function() {
        return 'mie.io';
    },
    hosts_allow: function() {
        return 'mie.io\nmieweb.com\ndomain.co';
    },
    user: function() {
        return Meteor.users.find();
    }
});

Template.adminstart.events = {
    'submit form': function(e) {
        e.preventDefault();

        Meteor.call("update_setting", 'server', 'domain_name', $(e.target).find('[name=domain_name]').val(), function(error, affectedDocs) {
            if (error) {
                console.log(error.message);
            } else {
                alert('domain_name worked');
            }
        });
        Meteor.call("update_setting", 'server', 'hosts_allow', $(e.target).find('[name=hosts_allow]').val(), function(error, affectedDocs) {
            if (error) {
                console.log(error.message);
            } else {
                alert('hosts_allow worked');
            }
        });
    }
}
