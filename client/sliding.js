/* support = {
	size: "100px",
	color: "black"
}

oppose = {
	size: "245px",
	color: "black"
}

Session.set("support", support);
Session.set("oppose", oppose);

Template.slider.support = function() { return Session.get("support"); }
Template.slider.oppose = function() { return Session.get("oppose"); }
*/

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

    target.style.zIndex = 2;        //Move over other handles
    dragElement = target;

    document.onmousemove = move;

    // prevent text selection in IE
    document.onselectstart = function () { return false; }
    // prevent IE from trying to drag an image
    target.ondragstart = function() { return false; }

     // prevent text selection (except IE)
    return false;
  }
}

function up() {
  if(dragElement != null) {       //We are dragging something
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

function getBg() {
  return "white";
}
