Meteor.methods({
  "insertUser" : function(user) {
    Accounts.createUser(user);
  },
  
  "logoutWithId" : function(userId) {
    Users.update({_id: userId}, {online: false});
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
    if(!Users.findOne({_id: myId})) {
      return NOT_LOGGED_IN;
    }
    if(text != "") {
      var myName = Users.findOne({_id: myId}).name;
      Issues.insert({issue: text, creator: myId, creatorName: myName, timestamp: new Date().getTime()});
      var oId = Issues.findOne({issue: text, creator: myId})._id;
      Users.find().forEach(function(user) {
        Positions.insert({uId: user._id, qId: oId, value: 245 + "px", text: ""});
      });
      return SUCCESS;
    }
    return NO_CHANGE;
  },

  "editIssue" : function(question, text) {
    text = text.trim();
    if(Issues.findOne({_id: question, issue: text})) {
      return NO_CHANGE;
    }
    Issues.update({_id: question}, {$set: {issue: text}});
    return SUCCESS;
  },

  "editRequest" : function(question, requestedText, creator) {
    requestedText = requestedText.trim();
    if(Requests.findOne({qId: question, text: requestedText}) || Issues.findOne({_id: question, issue: requestedText})) {
      return NO_CHANGE;
    }
    Requests.insert({
      qId: question,
      creatorId: creator,
      text: requestedText,
      timestamp: new Date().getTime()
    });
    return SUCCESS;
  },

  "deleteRequest" : function(requestId) {
    Requests.remove({_id: requestId});
    return SUCCESS;
  },

  
  "addUserDefaultPositions" : function(user) {
    Issues.find().forEach(function(question) {
      if(!Positions.findOne({uId: user, qId: question._id})) {
        Positions.insert({uId: user, qId: question._id, value: 245 + "px", text: ""});
      }
    });
  }
});

Accounts.onCreateUser(function(e, user) {
    var myName = user.emails ? user.emails[0].address.split("@")[0] : user._id;
    var number = 2 * (Meteor.call("getUserCount") + 1);
    Users.insert({_id: user._id, name: myName, line: number, online: true});
    Meteor.call("addUserDefaultPositions", user._id);
    return user;
});
