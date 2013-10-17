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
    var me = Positions.findOne({qId: question, uId: Meteor.userId()}) || {value: "245px", text: ""};
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
  
  Template.slider.events({
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
  });
  
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
      
      Meteor.call("insertIssue", Meteor.userId(), text.value);

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
