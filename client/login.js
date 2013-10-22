askToLogin  = function(text) {
  toastr.error(text);
  //get the top offset of the target anchor
  var target_offset = $("#login").offset();
  var target_top = target_offset.top;

  //goto that anchor by setting the body scroll top to anchor top
  $('html, body').animate({scrollTop:target_top}, 500);
}

$(document).ready(function() {
  $("#login_name").keypress(tryLogin);
  //$("#login_psswd").keypress(tryLogin);
});

function tryLogin(e) {
  if(e.keyCode == 13) {
    var userName = $("#login_name").val();
    //var userPsswd = $("#login_psswd").val();
    var userPsswd = "salon-password";
    if(!userName) {
      askToLogin("No username specified");
    //} else if(!userPsswd) {
      //askToLogin("No password given");
    } else if(Users.findOne({name: userName})) {
      askToLogin("Username already exists");
    } else {
        Accounts.createUser({
          username: userName,
          email: userName + "@.com",
          password: userPsswd
        });
        toastr.success("Logged in successfully!");
    }
  }
}
