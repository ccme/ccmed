Template.editprofile.events = {
    'submit form': function(e) {
        e.preventDefault();
        Meteor.users.update({
            _id: Meteor.user()._id
        }, {
            $set: {
                "profile.name": $(e.target).find('[name=fullname]').val(),
                "username": $(e.target).find('[name=username]').val()
            }
        });
    }
};


Template.email_list.helpers({
    email: function() {
        return Meteor.user().emails;
    }
});

Template.email_entry.events({
    'click [name=generate_keys]': function(event, template) {
        $(template.find('[name=generate_keys]')).text('Generating...');
        alert('Hit OK to start generating. Your browser may lock up for a moment.');

        //----------------- New RSA Stuff
        crypt = new JSEncrypt({
            default_key_size: 2048
        });
        var dt = new Date();
        var time = -(dt.getTime());
        crypt.getKey();
        dt = new Date();
        time += (dt.getTime());
        //----------------- End new RSA Stuff

        $(template.find('textarea[name="private_key"]')).val(crypt.getPrivateKey());
        $(template.find('textarea[name="public_key"]')).val(crypt.getPublicKey());
        $(template.find('[name=generate_keys]')).text('Generate');

    },
    'click [name=show_keys]': function(event, template) {
        $(template.find('[name=keys_wrap]')).show();
        $(template.find('[name=hide_keys]')).show();
        $(template.find('[name=generate_keys]')).show();
        $(template.find('[name=submit_keys]')).show();

        $(template.find('[name=show_keys]')).hide();

    },
    'click [name=hide_keys]': function(event, template) {
        $(template.find('[name=keys_wrap]')).hide();
        $(template.find('[name=hide_keys]')).hide();
        $(template.find('[name=generate_keys]')).hide();
        $(template.find('[name=submit_keys]')).hide();

        $(template.find('[name=show_keys]')).show();
    },
    'submit form': function(e, template) {
        e.preventDefault();

        var crypt_private = new JSEncrypt({
            default_key_size: 2048
        });
        crypt_private.setKey($(e.target).find('[name=private_key]').val());

        var crypt_public = new JSEncrypt({
            default_key_size: 2048
        });
        crypt_public.setKey($(e.target).find('[name=public_key]').val());

        var text = 'CCMED Test Encryption';
        // Encrypt the data with the public key.
        var enc = crypt_public.encrypt(text);

        // Now decrypt the crypted text with the private key.
        var dec = crypt_private.decrypt(enc);

        if (dec === text) {
            $(e.target).find('[name=submit_keys]').val('Saving...');
            Meteor.call("update_email_keys", $(e.target).find('[name=address]').val(), $(e.target).find('[name=private_key]').val(), $(e.target).find('[name=public_key]').val(), function(error, affectedDocs) {
                if (error) {
                    alert(error.message);
                } else {
                    $(e.target).find('[name=submit_keys]').val('Save');
                    console.log('Saved!');
                }
            });
            return true;
        } else {
            alert('Encryption/decryption test with your private/public key failed. Are you sure they are valid?');
            return false;
        }
    },
});

Template.addemail.events = {
    'submit form': function(e) {
        e.preventDefault();

        //TODO: This needs to be a real email check, maybe even on the server?
        if ($(e.target).find('[name=email]').val() == "") {
            alert('Please make sure you have filled in an email before hitting add.');
            return false;
        }

        var crypt_private = new JSEncrypt({
            default_key_size: 2048
        });
        crypt_private.setKey($(e.target).find('[name=private_key_email]').val());

        var crypt_public = new JSEncrypt({
            default_key_size: 2048
        });
        crypt_public.setKey($(e.target).find('[name=public_key_email]').val());

        var text = 'CCMED Test Encryption';
        // Encrypt the data with the public key.
        var enc = crypt_public.encrypt(text);

        // Now decrypt the crypted text with the private key.
        var dec = crypt_private.decrypt(enc);

        if (dec === text) {
            Meteor.users.update({
                _id: Meteor.user()._id
            }, {
                $addToSet: {
                    "emails": {
                        "address": $(e.target).find('[name=email]').val(),
                        "private_key": $(e.target).find('[name=private_key_email]').val(),
                        "public_key": $(e.target).find('[name=public_key_email]').val()
                    }
                }
            });
            alert('Email has been added successfully');
            $(e.target).find('[name=email]').val('');
            $(e.target).find('[name=private_key_email]').val('');
            $(e.target).find('[name=public_key_email]').val('');
            $('#add_email').attr('disabled');
            return true;
        } else {
            alert('Unable to add your new email. \nEncryption/decryption test with your private/public key failed. Are you sure they are valid?');
            return false;
        }
    },
    'click #generate': function(e, template) {
        $(e.target).text("Generating...");

        alert('Hit OK to start generating. Your browser may lock up for a moment.');

        //----------------- New RSA Stuff
        crypt = new JSEncrypt({
            default_key_size: 2048
        });
        var dt = new Date();
        var time = -(dt.getTime());
        crypt.getKey();
        dt = new Date();
        time += (dt.getTime());
        //----------------- End new RSA Stuff

        $('textarea[name="private_key_email"]').val(crypt.getPrivateKey());
        $('textarea[name="public_key_email"]').val(crypt.getPublicKey());
        $(e.target).text("Generate");
        $('#add_email').removeAttr('disabled');
    }
}
