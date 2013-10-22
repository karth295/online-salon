askToLogin  = function(text) {
  toastr.error(text);
  //get the top offset of the target anchor
  var target_offset = $("#login_banner").offset().top;

  //goto that anchor by setting the body scroll top to anchor top
  $('html, body').animate({scrollTop: target_offset}, 500);

  var login_stuff = document.querySelector("#login_banner").parentNode;
  $(login_stuff).addClass("animateBlue");
}

$(document).ready(function() {
  $("#login_name").keypress(tryLogin);
  //$("#login_psswd").keypress(tryLogin);
  $("#login").click(tryLogin);
});

function tryLogin(e) {
  if(e.keyCode == 13 || e.type == "click") {
    var userName = $("#login_name").val().trim();
    //var userPsswd = $("#login_psswd").val().trim();
    var userPsswd = "salon-password";
    if(!userName || userName.length < 5 || userName.length > 15) {
      askToLogin("Username must be between 5 and 15 characters");
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
