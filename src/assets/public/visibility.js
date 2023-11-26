const pass = document.getElementsByClassName("toggle-password");

/**
 * Toggle password fields between text/password
 * so user can see password
 */
for (let i = 0; i < pass.length; i++) {
  pass[i].addEventListener("click", (event) => {
    const target = event.currentTarget;
    const input = target.nextElementSibling;
    
    target.classList.toggle("show-password");
    if (input.type == "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  });
}
