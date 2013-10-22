SUCCESS = 1;
NO_CHANGE = 0;
FAILURE = -1;

var correct = "75px";

Handlebars.registerHelper('$online', function(uId) {
  return Users.findOne({_id: uId}).online;
});

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

Handlebars.registerHelper('$getBg', function() {
  return "black";
});

Handlebars.registerHelper('$getName', function(uId) {
  return Users.findOne({_id: uId}).name;
});

Handlebars.registerHelper('$getLine', function(uId) {
  return getLine(uId);
});

Handlebars.registerHelper('$getLineNotification', function(uId) {
  var name = getLine(uId);
  return name ? name - .6 : name;
});

Handlebars.registerHelper('findMyPos', function(question) {
  return Positions.findOne({qId: question, uId: Meteor.userId()});
});

function getBg(left) {
  return "white";
}

function getLine(uId) {
  return Users.findOne({_id: uId}) ? Users.findOne({_id: uId}).line : "";
}
