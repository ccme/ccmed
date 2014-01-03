
Messages = new Meteor.Collection("Messages");

Messages.allow({
  insert: function (userId, message) {
    return false; // no cowboy inserts -- use createmessage method
  },
  update: function (userId, message, fields, modifier) {
    if (userId !== message.owner)
      return false; // not the owner

    var allowed = ["title", "description", "x", "y"];
    if (_.difference(fields, allowed).length)
      return false; // tried to write to forbidden field

    // A good improvement would be to validate the type of the new
    // value of the field (and if a string, the length.) In the
    // future Meteor will have a schema system to makes that easier.
    return true;
  },
  remove: function (userId, message) {
    // You can only remove Messages that you created and nobody is going to.
    return message.owner === userId && attending(message) === 0;
  }
});

var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

Meteor.methods({
  // options should include: title, description, x, y, public
  createmessage: function (options) {
    check(options, {
      title: NonEmptyString,
      description: NonEmptyString,
      public: Match.Optional(Boolean)
    });

    if (options.title.length > 100)
      throw new Meteor.Error(413, "Title too long");
    if (options.description.length > 1000)
      throw new Meteor.Error(413, "Description too long");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in");

    return Messages.insert({
      owner: this.userId,
      x: options.x,
      y: options.y,
      title: options.title,
      description: options.description,
      public: !! options.public,
      invited: [],
      rsvps: []
    });
  },


});

///////////////////////////////////////////////////////////////////////////////
// Users

displayName = function (user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};

var contactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
};
