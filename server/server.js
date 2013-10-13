Meteor.methods({
  "logoutWithId" : function(userId) {
  
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
  },

  "insertIssue" : function(myId, text) {
    var myName = Users.findOne({_id: myId}).name;
    Issues.insert({issue: text, creator: myId, creatorName: myName, timestamp: new Date().getTime()});
    var oId = Issues.findOne({issue: text, creator: myId})._id;
    Users.find().forEach(function(user) {
      Positions.insert({uId: user._id, qId: oId, value: 245 + "px", text: ""});
    });
  },

  "editIssue" : function(question, text) {
    Issues.update({_id: question}, {$set: {issue: text}});
  },

  "editRequest" : function(question, text) {
    var request_object = {timestamp: new Date().getTime(), request: text}
    Issues.update({_id: question}, {$push: {requests: request_object}});
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
