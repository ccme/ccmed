Meteor.subscribe('Server');
Meteor.subscribe('Users');

Template.adminstart.helpers({
    domain_name: function() {
        try{
        return 'TODO: mie.io (' + Server.findOne().os.network.hostname + ')';
    }
    catch(e){
        return 'Please wait...';
    }
    },
    hosts_allow: function() {
        return 'TODO: mie.io\nmieweb.com\ndomain.co';
    },
    user: function() {
        return Meteor.users.find();
    },
    setting: function(){
        return Server.findOne();
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
