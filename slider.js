//Fields:
	//qId: the ID of the discussion point
	//uId: the ID of the user whose position this is
	//value: the left property of the slider
	//text: the text the user has for this position
Positions = new Meteor.Collection("pos");

//Fields:
	//_id: The ID of the discussion point
	//issue: The text of the discussion point itself
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

if (Meteor.isClient) {

  var correct = "75px";
  
  /* Handlebars.registerHelper('add', function(left, offset) {
	return left + offset;
  });
  
  Handlebars.registerHelper('$eq', function(a, b) {
      return a == b; 
  });
  
  Handlebars.registerHelper('$find', function(question) {
    return Positions.find({qId: question});
  });
 
  Handlebars.registerHelper('$evi', function(question) {
    return Evidence.find({qId: question});
  });

  Handlebars.registerHelper('$concat', function(first, second) {
    return first + "" + second; //In case they are both numbers
  });

  Handlebars.registerHelper('$add', function(first, second) {
    return parseInt(first) + parseInt(second);
  });

  Handlebars.registerHelper('$getBg', function(left) {
    return getBg(parseInt(left) + 10);
  });

  Handlebars.registerHelper('$getName', function(uId) {
    return Users.findOne({_id: uId}).name;
  });

  Handlebars.registerHelper('$getLine', function(uId) {
    return Users.findOne({_id: uId}).line;
  });

  Handlebars.registerHelper('findMyPos', function(question) {
    return Positions.findOne({qId: question, uId: Meteor.userId()});
  }); */

  Template.myPos.rendered = function() {
    var question = this.firstNode.classList[1].substring(2);
    var me = Positions.findOne({qId: question, uId: Meteor.userId()});
    console.log(question);
    console.log(me);
    this.find(".speech").style.left = me.value;
    this.find("textarea").value = me.text;
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

  Template.slider.rendered = function() {
    document.onmousedown = down;
    document.onmouseup = up;

    var windows = document.querySelectorAll("p.speech");
    for(var i = 0; i < windows.length; i++) {
      windows[i].style.backgroundColor = getBg(parseInt(window.getComputedStyle(windows[i]).left) + 10);
    }
  }

  var startX = 0;            // mouse starting positions
  var startY = 0;
  var offsetX = 0;           // current element offset
  var dragElement;           // needs to be passed from OnMouseDown to OnMouseMove
  var oldZIndex = 0;         // we temporarily increase the z-index during drag

  function down(e) {
	var e = e ? e : window.event;
	var target = e.target ? e.target : e.srcElement;
	
	if(e.target.className.indexOf("draggable") != -1 && (e.button == 0 || e.button == 1)) {
		startX = e.clientX;
		offsetX = parseInt(window.getComputedStyle(target).left);
		
		target.style.zIndex = 2;	//Move over other handles
		dragElement = target;
		
		document.onmousemove = move;
		//document.body.focus();
		
		
		// prevent text selection in IE
        document.onselectstart = function () { return false; }
        // prevent IE from trying to drag an image
        target.ondragstart = function() { return false; }
        
        // prevent text selection (except IE)
        return false;
	}
  }

  function up() {
	if(dragElement != null) {	//We are dragging something
		var qId = dragElement.parentNode.parentNode.parentNode.id.substring(2);
		Meteor.call("updateValue", Meteor.userId(), qId, dragElement.style.left);
		dragElement.style.zIndex = 1;
		
		document.onmousemove = null;
		document.onselectstart = null;
		dragElement.ondragstart = null;
		dragElement = null;
		
		//document.querySelector("#" + qId + " .editable textarea").focus();
	}
  }

  function move(e) {
	var e = e ? e : window.event;
	var calculated = offsetX + e.clientX - startX;
	calculated = Math.max(calculated, -10);
	calculated = Math.min(calculated, parseInt(window.getComputedStyle(document.querySelector(".slider")).width) - 10);
	var qId = dragElement.parentNode.parentNode.parentNode.id;
	dragElement.style.left = calculated + "px";
	var edit = document.querySelector("#" + qId + " .editable");
	edit.style.left = calculated + "px";
        edit.style.backgroundColor = getBg(calculated + 10);
        
        var div = dragElement.parentNode.parentNode;

	div.querySelector(".support").style.fontSize = 20 + (calculated + 10 - 250) / 25 + "pt";
	div.querySelector(".oppose").style.fontSize = 20 - (calculated + 10 - 250) / 25 + "pt";
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
  
  var currTime = null;
  
  Template.slider.events({
    'blur .editable .words' : function(e) {
      update_text(e);
    }
  });

  Template.slider.events({
    'mouseover .circle' : function(e) {
      var find = e.target.classList[e.target.classList.length - 1];
      var pos = e.target.parentNode.parentNode.querySelector(".positions ." + find);
      pos.style.display = "";
    },

    'mouseout .circle' : function(e) {
      var find = e.target.classList[e.target.classList.length - 1];
      e.target.parentNode.parentNode.querySelector(".positions ." + find).style.display = "none";
    },

    'mouseover .nameonly' : function(e) {
      e.target.style.display = "none";

      closeAllBubbles();

      e.target.parentNode.querySelector(".nobubble").style.display = "";
      e.target.parentNode.querySelector(".line").style.borderWidth = "5px";
    },

    'mouseout .nobubble' : function(e) {
      if(e.target.classList.contains("nobubble")) {
        e.target.style.display = "none";
        e.target.parentNode.querySelector(".nameonly").style.display = "";
        e.target.parentNode.querySelector(".line").style.borderWidth = "1px";
      }
    },

    'keyup .words' : function(e) {
      if(currTime)
        clearTimeout(currTime);
      currTime = setTimeout(update_text, 3000, e);
    }
  });

  function update_text(e) {
    console.log("Update");
    var qId = e.target.parentNode.parentNode.parentNode.parentNode.id;
    qId = qId.substring(2);
    if(currTime)
      clearTimeout(currTime);
    currTime = null;
    Meteor.call("updateText", Meteor.userId(), qId, e.target.value);
    e.target.focus();
  }

  function closeAllBubbles() {
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
    return Issues.find();
  }
  
  Template.issues.events({
    'click .edit' : function(e) {
      Issues.update({_id: e.target.parentNode.id.substring(2)}, {$set: {editor: Meteor.userId()}});
    },
    
    'click .done' : function(e) {
      var text = document.querySelector("#" + e.target.parentNode.id + " textarea").value;
      Issues.update({_id: e.target.parentNode.id.substring(2)}, {$set: {issue: text}, $unset: {editor: ""}});
    },

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
    
      Issues.insert({issue: text.value});
      var oId = Issues.findOne({issue: text.value})._id;
      Users.find().forEach(function(user) {
        Positions.insert({uId: user._id, qId: oId, value: 245 + "px", text: ""});
      });
      text.value = "";
      e.target.style.display = "none";
    }
  });

  window.onbeforeunload = logout;
  Meteor.logout = logout;
  function logout() {
    Meteor.call("logoutWithId", Meteor.userId());
  }
}

/* Meteor.methods({
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

if (Meteor.isServer) {
  Meteor.startup(function () {
    
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
} */
