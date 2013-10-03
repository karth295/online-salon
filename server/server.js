Meteor.methods({
  "logoutWithId" : function(userId) {
    Issues.update({editor: userId}, {$unset: {editor: ""}});
  },

  "updateValue" : function(userId, question, newLeft) {
    Positions.update({uId: userId, qId: question}, {$set: {value: newLeft}});
  },

  "updateText" : function(userId, question, newText) {
    Positions.update({uId: userId, qId: question}, {$set: {text: newText}});
  },

  "getUserCount" : function() {
    var count = 0;
    Users.find().forEach(function() {
      count++;
    });
    return count;
  }
});

Accounts.onCreateUser(function(e, user) {
    var myName = user.emails ? user.emails[0].address.split("@")[0] : user._id;
    var number = 2 * (Meteor.call("getUserCount") + 1);
    Users.insert({_id: user._id, name: myName, line: number});
    Issues.find().forEach(function(el) {
      Positions.insert({uId: user._id, qId: el._id, value: 245 + "px", text: ""});
    });
    return user;
});
