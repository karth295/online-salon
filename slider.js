Positions = new Meteor.Collection("pos");
Issues = new Meteor.Collection("issues");
Evidence = new Meteor.Collection("evi");
Users = new Meteor.Collection("mah_users");

if (Meteor.isClient) {

  var correct = "75px";
  
  Handlebars.registerHelper('add', function(left, offset) {
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

  Handlebars.registerHelper('$getString', function(user, question) {
    console.log(user + "" + question + "__" + Positions.findOne({uId: user, qId: question}).change);
    return user + "" + question + "__" + Positions.findOne({uId: user, qId: question}).change;
  });

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
  
  /* Template.slider.events({
    'click .editable .notyping' : function(e) {
      e.target.style.display = "none";
      var box = e.target.parentNode.querySelector("textarea");
      box.style.display = "";
      box.focus();
    }
  }); */

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
    /* var width = 489;
    var g = Math.max(parseInt(left / width * 255), 0);
    var r = 255 - g;
    var b = g < 128 ? g*2 : r*2;
    var rgb = [Math.round(r*1.5), Math.round(g*1.5), 0];
    return "rgb(" + rgb.join(",") + ")"; */

    //var width = 489;
    //var wheel = Math.round(left / width * 120);
    
    /* var hello = left / 490;
    var wheel = 60;
    if(hello < .33) {
      wheel = 0;
    } else if(hello > .67) {
      wheel = 120;
    }

    var sat = Math.abs(hello * 2 - 1) * 40 + 50 + "%";

    //return "hsla(" + [wheel, sat, "60%", "1"].join(", ") + ")"; */
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
        Positions.insert({uId: user._id, qId: oId, value: 245 + "px", text: "", change: 0});
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

if (Meteor.isServer) {
  Meteor.startup(function () {
    
  });

  Accounts.onCreateUser(function(e, user) {
    var myName = user.emails ? user.emails[0].address.split("@")[0] : user._id;
    var number = 2 * (Meteor.call("getUserCount") + 1); 
    Users.insert({_id: user._id, name: myName, line: number});
    Issues.find().forEach(function(el) {
      Positions.insert({uId: user._id, qId: el._id, value: 245 + "px", text: "", change: 0});
    });
    return user;
  });
}
