Meteor.subscribe("userStatus");

Handlebars.registerHelper('notloggedin', function() {
    if (Meteor.user()) {
        return false;
    } else {
        return true;
    }
});

Handlebars.registerHelper('firstrun', function() {
    if (Meteor.users.find().count() != 0) {
        return false;
    } else {
        return true;
    }
});

Handlebars.registerHelper('isadmin', function() {
    if (Meteor.user()) {
        if (Meteor.user().profile.admin == 1) {
            return true;
        } else {
            return false;
        }
    }
});

Handlebars.registerHelper('inbox_count', function() {
    if (Meteor.userId()) {
        return Messages.find().count();
    }
});

Handlebars.registerHelper('usercount', function() {
    return Meteor.users.find().count();
});

Handlebars.registerHelper('usercountonline', function() {
    return Meteor.users.find({
        "status.online": true
    }).count();
});

Handlebars.registerHelper('md5', function(string) {
    if (string.contains('<')) {
        string.replace('<', '');
    }
    if (string.contains('>')) {
        string.replace('>', '');
    }
    return CryptoJS.MD5(string).toString();
});

Meteor.Router.add({
    '/': 'home',
    '/home': 'home',
    '/about': 'about',
    '/setup': 'setup',
    '/messages': 'messages',
    '/feed': 'feed'
});

Meteor.Router.filters({
    requireLogin: function(page) {
        if (Meteor.users.find().count() == 0) {
            return 'setup';
        }
        var skip_auth = 'about';

        if (skip_auth == page) {
            return page;
        }
        if (Meteor.loggingIn()) {
            return 'loading';
        } else if (Meteor.user()) {
            return page;
        } else {
            return 'login';
        }
    }
});

Meteor.Router.filter('requireLogin')
