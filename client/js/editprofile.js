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
Template.userkeys.events = {
    'submit form': function(e) {
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

        console.log(dec);
        // Now a simple check to see if the round-trip worked.
        if (dec === text) {
            Meteor.users.update({
                _id: Meteor.user()._id
            }, {
                $set: {
                    "private_key": $(e.target).find('[name=private_key]').val(),
                    "public_key": $(e.target).find('[name=public_key]').val()
                }
            });
            return true;
        } else {
            alert('Unable to run encryption/decryption test with your private/public key. Are you sure they are valid?');
            return false;
        }
    },
    'click #generate_private_key': function(e, template) {
        $('#generate_private_key').text("Generating...");
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

        $('textarea[name="private_key"]').val(crypt.getPrivateKey());
        $('textarea[name="public_key"]').val(crypt.getPublicKey());
        $('#generate_private_key').text("Generate");
    },
    'click #show_private_key': function(e, template) {
        $('#private_key_wrap').fadeIn();
        $('#hide_private_key').show();
        $('#generate_private_key').show();
        $('#submit_private_key').show();
        $('#show_private_key').hide();
    },
    'click #hide_private_key': function(e, template) {
        $('#private_key_wrap').fadeOut();
        $('#hide_private_key').hide();
        $('#generate_private_key').hide();
        $('#submit_private_key').hide();
        $('#show_private_key').show();
    }
};
