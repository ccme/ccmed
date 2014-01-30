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
    Meteor.users.update({
      _id: Meteor.user()._id
    }, {
      $set: {
        "private_key": $(e.target).find('[name=private_key]').val(),
        "public_key": $(e.target).find('[name=public_key]').val()
      }
    });
  },
  'click #generate_private_key': function(e, template) {
    var passphrase = $('input[name="passphrase"]').val();
    if (passphrase == "") {
      alert('You need to have a passphrase before you can generate a private key.');
    } else {
      $('#generate_private_key').text("Generating...");
      alert('Hit OK to start generating. Your browser may lock up for a moment.');
      var bits = 2048;
      var RSAkey = cryptico.generateRSAKey(passphrase, bits);
      var PublicKeyString = cryptico.publicKeyString(RSAkey);
      $('textarea[name="private_key"]').val(JSON.stringify(RSAkey));
      $('textarea[name="public_key"]').val(PublicKeyString);
      $('#generate_private_key').text("Generate");
    }
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