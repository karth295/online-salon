Meteor.methods({
  "logoutWithId" : function(userId) {
    
  },

  "updateValue" : function(userId, question, newLeft) {
    Positions.update({uId: userId, qId: question}, {$set: {value: newLeft}});
  },

  "updateText" : function(userId, question, newText) {
    if(Positions.findOne({uId: userId, qId: question, text: newText})) {
      return 0;
    }
    Positions.update({uId: userId, qId: question}, {$set: {text: newText}});
    return 1;
  },

  "getUserCount" : function() {
    var count = 0;
    Users.find().forEach(function() {
      count++;
    });
    return count;
  },

  "insertIssue" : function(myId, text) {
    text = text.trim();
    var myName = Users.findOne({_id: myId}).name;
    Issues.insert({issue: text, creator: myId, creatorName: myName, timestamp: new Date().getTime()});
    var oId = Issues.findOne({issue: text, creator: myId})._id;
    Users.find().forEach(function(user) {
      Positions.insert({uId: user._id, qId: oId, value: 245 + "px", text: ""});
    });
    return 1;
  },

  "editIssue" : function(question, text) {
    text = text.trim();
    if(Issues.findOne({_id: question, issue: text})) {
      return 0;
    }
    Issues.update({_id: question}, {$set: {issue: text}});
    return 1;
  },

  "editRequest" : function(question, requestedText, creator) {
    requestedText = requestedText.trim();
    if(Requests.findOne({qId: question, text: requestedText})) {
      return 0;
    }
    Requests.insert({
      qId: question,
      creatorId: creator,
      text: requestedText,
      timestamp: new Date().getTime()
    });
    return 1;
  },

  "deleteRequest" : function(requestId) {
    Requests.remove({_id: requestId});
    return 1;
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
