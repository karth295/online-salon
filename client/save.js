Template.myPos.events({
  'click .save' : function(e) {
    var qId = e.target.parentNode.parentNode.parentNode.classList[1].substring(2);
    var text = e.target.parentNode.parentNode.querySelector(".words");
    update_text(text, qId);
  },

  'keypress .editable .words' : function(e) {
    var text = e.target;
    if(e.charCode == 13) {
      e.preventDefault();
      var qId = text.parentNode.parentNode.classList[1].substring(2);
      update_text(text, qId);
    } else {
      text.parentNode.querySelector(".save").style.display = "";
    }
  },

  'keyup .editable .words' : function(e) {
    if(e.keyCode == 8) {	//Handle backspace
      e.target.parentNode.querySelector(".save").style.display = "";
    }
  }
});

function update_text(text, qId) {
  Meteor.call("updateText", Meteor.userId(), qId, text.value, function(err, exit_status) {
    if(exit_status == 1) {
      toastr.success("Position saved successfully");
    } else if(exit_status == 0) {
       //toastr.warning("No change");
    } else {
       toastr.error("Position not updated");
    }
  });
  text.blur();
  text.parentNode.querySelector(".save").style.display = "none";
}
