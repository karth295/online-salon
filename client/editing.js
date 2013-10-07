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
    if(issue.creator == Meteor.userId()) {
      Meteor.call("editIssue", question, text);
    } else {
      Meteor.call("editRequest", question, text);
    }
  }
});
