//Fields:
	//qId: the ID of the discussion point
	//uId: the ID of the user whose position this is
	//value: the left property of the slider
	//text: the text the user has for this position
Positions = new Meteor.Collection("pos");

//Fields:
	//_id: The ID of the discussion point
	//issue: The text of the discussion point itself
	//creator: userId of whomever created this point
	//creatorName: The name of whomever created this point
	//timestamp: When this point was created
Issues = new Meteor.Collection("issues");

//Fields:
	//qId: The ID of the discussion point
	//text: The URL submitted
Evidence = new Meteor.Collection("evi");

//Fields: 
	//_id: The user's userId
	//name: The user's name, currently any part of the email before the @ sign
	//line: The line the user will appear on other screens
Users = new Meteor.Collection("mah_users");

//Fields:
	//_id: Request's id
	//qId: Issue's _id
	//creatorId: creator's userId
	//text: The request
	//timestamp: date
Requests = new Meteor.Collection("requests");

if (Meteor.isClient) {

  me = {
         id: ""
       }
  
  Meteor.autorun(function() {
    if(Meteor.user()) {
      me.id = Meteor.userId();
      Users.update({_id: me.id}, {$set: {online: true}});
      Meteor.call("addUserDefaultPositions", me.id);
    } else {
      if(me.id) {
        Users.update({_id: me.id}, {$set: {online: false}});
      }
    }
  });

  var correct = "75px";

  /* document.onclick = function(e) {
    closeAllBubbles();
  } */

  Template.otherBubble.rendered = function() {
    this.find(".notification").style.display = "";
  }

  Template.otherBubble.events({
    'mouseover .handle' : function(e) {
      e.target.style.backgroundColor = "";
      e.target.parentNode.querySelector(".notification").style.display = "none";
    }
  });

  Template.myPos.rendered = function() {
    var question = this.firstNode.classList[1].substring(2);
    var mePos = Positions.findOne({qId: question, uId: me.id}) || {value: "245px", text: ""};
    this.find(".speech").style.left = mePos.value;
    this.find("textarea").value = mePos.text;
  }

  Template.slider.getHeight = function() {
    var count = 0;
    Users.find().forEach(function() {
      count++;
    });
    return 380 + 26 * (count - 1) + "px";
  }

  Template.slider.correctionFactor = function() {
    return correct;
  }

  Template.myPos.correctionFactor = function() {
    return correct;
  }

  Template.welcome_message.events({
    'click .expand' : function(e) {
      var target = e.target;
      target.style.display = "none";
      target.parentNode.querySelector(".contract").style.display = "";
      var div = target.parentNode.parentNode.querySelector(".hidden");
      div.classList.remove("hidden");
      div.classList.add("visible");
    }, 

    'click .contract' : function(e) {
      var target = e.target;
      target.style.display = "none";
      target.parentNode.querySelector(".expand").style.display = "";
      var div = target.parentNode.parentNode.querySelector(".visible");
      div.classList.remove("visible");
      div.classList.add("hidden");
    }
  });
  
  closeAllBubbles = function() {
    var bubbs = document.querySelectorAll(".nobubble");
    for(var i = 0; i < bubbs.length; i++) {
      if(bubbs[i].style.display != "none") {
        bubbs[i].style.display = "none";
        bubbs[i].parentNode.querySelector(".nameonly").style.display = "";
        bubbs[i].parentNode.querySelector(".line").style.borderWidth = "1px";
      }
    }
  }

  function getBg(left) {
    return "white";
  }

  Template.issues.issues = function() {
    return Issues.find({}, {sort: {timestamp: -1}});
  }
  
  Template.issues.events({
    'keypress .evidence textarea' : function(e) {
      if(e.keyCode == 13) {
        var url = e.target.value;
        var regex = /^(https?:\/\/(www\.)?\S*\.(com|net|gov|info|org)(\/\S*)*\/?)$/;
        if(regex.test(url)) {
	  var question = e.target.parentNode.parentNode.id.substring(2);
          Evidence.insert({qId: question, text: url});
          e.target.placeholder = "";
        } else {
          e.target.placeholder = "Not a valid link";
        }
        e.target.value = "";
      }
    },
    
    'click #addButton' : function(e) {
      e.target.style.display = "none";
      document.getElementById("addBox").style.display = "";
      document.getElementById("insertButton").style.display = "";
    },

    'click #insertButton' : function(e) {
      document.getElementById("addButton").style.display = "";
      var text = document.getElementById("addBox");
      text.style.display = "none";
      
      Meteor.call("insertIssue", me.id, text.value);

      text.value = "";
      e.target.style.display = "none";
    }
  });

  /* window.onbeforeunload = logout;
  Meteor.logout(logout);
  function logout() {
    Meteor.call("logoutWithId", me.id);
  } */
}
