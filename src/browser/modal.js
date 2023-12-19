// Add show modal to buttons
$(document).on("click", ".show-modal", (event) => {
  const showTarget = event.currentTarget.dataset.cmsTarget;

  if (showTarget === "modal-add-page") {
    document.getElementById("add-page-folder-select").value = event.currentTarget.dataset.cmsValue;
  }

  const modal = document.getElementById(showTarget);
  modal.style.opacity = 1;
  modal.style.visibility = "visible";
});

// Add Hide modal to modal buttons
$(document).on("click", ".hide-modal", (event) => {
  const modal = event.target.closest(".modal");
  modal.style.opacity = 0;
  modal.style.visibility = "hidden";
});

// Hide Modal if clicked outside of content
window.onclick = (event) => {
  if (event.target.classList.contains("modal")) {
    const modal = event.target;

    modal.style.opacity = 0;
    modal.style.visibility = "hidden";
  }
};

function hideModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.style.opacity = 0;
  modal.style.visibility = "hidden";
}
