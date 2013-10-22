Template.pointTitle.events({
  'click .edit' : function(e) {
    var p = e.target.parentNode;
    p.querySelector(".amEdit").style.display = "";
    p.querySelector(".done").style.display = "";
    e.target.style.display = "none";
  },

  'click .done' : function(e) {
    var p = e.target.parentNode;
    var question = p.id.substring(2);
    p.querySelector(".edit").style.display = "";
    var text = p.querySelector(".amEdit").value;
    p.querySelector(".amEdit").style.display = "none";
    e.target.style.display = "none";
    var issue = Issues.findOne({_id: question});

    var exit_status = false;
    if(issue.creator == Meteor.userId()) {
      Meteor.call("editIssue", question, text, success_pointUpdate);
    } else {
      Meteor.call("editRequest", question, text, success_requestEntered);
    }
  },

  'mouseover .requests' : function(e) {
    var parent = e.target.parentNode;
    parent.querySelector(".hide_requests").style.display = "";
    parent.querySelector(".requests_bubble").style.display = "";
    e.target.style.display = "none";
  },

  'click .hide_requests' : hideRequests,

  'mouseout .requests_bubble' : hideRequests,
});

Template.viewRequests.events({
  'click .approve' : function(e) {
    var qId = e.target.parentNode.parentNode.parentNode.id.substring(2);
    var text = e.target.parentNode.textContent;
    Meteor.call("editIssue", qId, text);
    Meteor.call("deleteRequest", e.target.parentNode.id.substring(2), success_pointUpdate);
  },

  'click .reject' : function(e) {
    var qId = e.target.parentNode.parentNode.parentNode.id.substring(2);
    var text = e.target.parentNode.textContent;
    Meteor.call("deleteRequest", e.target.parentNode.id.substring(2));
  }  
});

Handlebars.registerHelper("$getRequests", function(question) {
  return Requests.find({qId: question});
});

function success_pointUpdate(err, exit_status) {
  if(exit_status == SUCCESS) {
    toastr.success("Discussion point updated");
  } else if(exit_status == NO_CHANGE) {
    //toastr.warning("No change");
  } else {
    toastr.error("Discussion point not updated :(");
  }
}

function success_requestEntered(err, exit_status) {
  if(exit_status == SUCCESS) {
    toastr.success("Request sent");
  } else if(exit_status == NO_CHANGE) {
    toastr.warning("Request already exists");
  } else {
    toastr.error("Request not sent :(");
  }
}

function hideRequests(e) {
    var parent = e.target.parentNode;
    parent.querySelector(".requests").style.display = "";
    parent.querySelector(".requests_bubble").style.display = "none";
    parent.querySelector(".hide_requests").style.display = "none";
    e.target.style.display = "none";
}
