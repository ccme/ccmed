Template.right.helpers({
    message: function() {
        return Messages.find();
    },
    format_gravatar: function(string) {
        string = string.replace('<', '');
        string = string.replace('>', '');
        return CryptoJS.MD5(string).toString();
    }
});
