/**
 * CRUD
 */

// Create (POST)
$(document).on("click", ".create", (event) => {
  const button = event.currentTarget;
  const form = $(`#${button.dataset.cmsForm}`);
  const postData = form.serialize();

  output(`${button.dataset.cmsText}`);

  button.classList.add("spinner");
  button.disabled = true;

  $.post(`${button.dataset.cmsUrl}`, postData)
    .done((response) => {
      output("Success");
      $(`#${button.dataset.cmsAnchor}`).html(response);
      initSortable();
    })
    .fail((response) => {
      output("Fail: " + response.responseText, true);
    })
    .always(() => {
      button.classList.remove("spinner");
      button.disabled = false;
      if (button.dataset.cmsModal) {
        console.log("test")
        const modal =$(`#${button.dataset.cmsModal}`)
        modal.css("visibility", "hidden");
        modal.css("opacity", 0);
      }
    });
});

// Update (PUT)
$(document).on("click", ".update", (event) => {
  const button = event.currentTarget;
  const putData = new FormData(document.getElementById(`${button.dataset.cmsForm}`));

  output(`${button.dataset.cmsText}`);

  button.classList.add("spinner");
  button.disabled = true;

  $.ajax({
    url: "",
    type: "PUT",
    data: putData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Success");
      $(`#${button.dataset.cmsAnchor}`).html(response);
      $(".toggle").trigger("change");
      initSortable();
      reloadPreview();
    })
    .fail((response) => {
      output("Failed to save draft", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.classList.remove("spinner");
      button.disabled = false;
    });
});

// Delete (DELETE)
$(document).on("click", ".delete", (event) => {
  const button = event.currentTarget;
  const deleteTarget = button.dataset.cms;

  if (confirm(`${button.dataset.cmsText} ${deleteTarget}?`)) {
    output(`sending delete request to server: ${deleteTarget}`);
    button.classList.add("spinner");
    button.disabled = true;

    $.ajax({ url: `${button.dataset.cmsUrl}/${deleteTarget}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log(response)
        $(`#${button.dataset.cmsAnchor}`).html(response);
        initSortable();
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
      })
      .always(() => {
        button.classList.remove("spinner");
        button.disabled = false;
      });
  }
});
/*
 * Sections
 */
$(document).on("click", ".add", (event) => {
  const button = event.currentTarget;
  const selected = $(button.dataset.cmsTarget);
  output(button.dataset.cmsText);

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  $(button.dataset.cmsAnchor).prepend($(`#${selected.val()}-template`)
    .html());

  orderSections();
  $(".toggle").trigger("change");
});

$(document).on("click", ".remove", (event) => {
  const button = event.currentTarget;

  output(`Removed ${button.dataset.cmsText}`);
  button.closest(button.dataset.cmsTarget).remove(0);
  orderSections();
});

$(document).on("click", ".block-add", (event) => {
  const button = event.currentTarget;
  const index = button.dataset.cms;
  const indexId = index.replace(/[\[\]]/g, "");

  const parent = $(event.currentTarget.closest(".block-controller"));
  const selected = parent.find(".block-select");
  output(selected.val() + "-block-template");

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  parent.find(".block-anchor").prepend($(`#${selected.val()}-block-template`)
    .html()
    .replace(/qq.*q/g, `qq${unique}q`)
    .replace(/ww0ww/g, index)
    .replace(/zz0zz/g, indexId));

  orderSections();
  $(".toggle").trigger("change");
});

$(document).on("click", ".section-delete", (event) => {
  const button = event.currentTarget;
  const deleteSection = button.dataset.cms;

  if (confirm(`Do you want to delete ${deleteSection} section?\n(You will also need to save draft)`)) {
    output(`deleted ${deleteSection} section`);
    button.closest(".cms-section").remove(0);
    orderSections();
  }
});

$(document).on("click", ".copy", (event) => {
  const button = event.currentTarget;

  const copy = $(button.closest(button.dataset.cmsTarget))
  const parent = copy.parent()
  parent.prepend(copy.clone())

  orderSections();
  initSortable();
});

function orderSections() {
  console.log("ordering sections")
  $(".cms-section").each((sectionIndex, sectionItem) => {
    // Form names
    $(sectionItem)
      .find("[name*='section']")
      .each((index, item) => {
        let name = $(item)
          .attr("name")
          .replace(/sections\[[^\]]*\]/, `sections[${sectionIndex}]`);

        $(item).attr("name", name);
      });
  });

  $(".block-anchor").each((index, anchor) => {
    $(anchor)
      .find(".cms-block")
      .each((blockIndex, blockItem) => {
        $(blockItem)
          .find("[name]")
          .each((index, item) => {
            let name = $(item)
              .attr("name")
              .replace(/content]\[(.*)]\[[0-9]*]/, `content][$1][${blockIndex}]`);

            $(item).attr("name", name);
          });
      });
  });
}

/*
 * Remember Collapse event
 */

$(document).on("show.bs.collapse", (event) => {
  let memory = event.target.querySelector(".remember-collapse");
  if (memory) memory.value = "show";
});

$(document).on("hide.bs.collapse", (event) => {
  let memory = event.target.querySelector(".remember-collapse");
  if (memory) memory.value = "hide";
});

/*
 * Display/Hide on Select
 */
$(document).on("change", ".toggle", selectToggle);
$(".toggle").trigger("change");

function selectToggle(event) {
  const select = event.currentTarget;
  const targets = select.dataset.cmsTargets.split(" ")
  const values = select.dataset.cmsValues.split(" ")

  console.log("targets", targets)
  console.log("values: ",values)

  for (target of targets) {
    if (target.charAt(0) == "!") {
      $(`#${target.slice(1)}`).show();
    } else {
      $(`#${target}`).hide();
    }
  }

  for (let i = 0; i < values.length; i++) {
    if (values[i] == select.value) {
      if (targets[i].charAt(0) == "!") {
        $(`#${targets[i].slice(1)}`).hide();
      } else {
        $(`#${targets[i]}`).show();
      }
    }
  }
}
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
const hideModals = document.getElementsByClassName("hide-modal");
for (let i = 0; i < hideModals.length; i++) {
  hideModals[i].addEventListener("click", (event) => {
    const modal = event.target.closest(".modal");
    modal.style.opacity = 0;
    modal.style.visibility = "hidden";
  });
}

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

/**
 * 
 * @param {String} message - Text to display on output  
 * @param {Boolean} fail - Displays red text if true
 */
function output(message, fail) {
  const now = new Date();

  if (fail) {
    $("#output").prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    <span class="text-danger">${message}</span><br>`);
  } else {
    $("#output").prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    ${message}<br>`);
  }
  $("#output").animate({ scrollTop: 0 }, "fast");
}

const adminUrl = window.location.href.replace("/pages", "");

function updateFolders() {
  const folders = $("input[name='folders'").serialize()

  $.ajax({
    url: adminUrl + "/page-folders",
    type: "PUT",
    data: folders,
  })
}
window.addEventListener("load", (event) => {
  document.body.classList.remove("preload")
});
let activeTransition = false;

$(document).on("click", ".roller-toggle", (event) => {
  if (!activeTransition) {
    activeTransition = true;
    const button = event.currentTarget;
    const roller = $(button.closest(".roller"));

    const rollerHeader = roller.find(".roller-header").first();
    const rollerBody = roller.find(".roller-body").first();
    const memory = roller.find(".remember-collapse").first();

    if (rollerHeader.hasClass("show-on-load")) {
      rollerBody.css("max-height", rollerBody.prop("scrollHeight"));
      memory.val("hide");
      
      setTimeout(() => {
        rollerBody.css("max-height", 0);
        rollerHeader.removeClass("show-on-load");
        rollerBody.removeClass("show-on-load");
        activeTransition = false;
      }, 10);
    } else {
      rollerHeader.toggleClass("show");
      rollerBody.toggleClass("show");
      
      if (rollerBody.css("max-height") == "0px") {
        rollerBody.css("max-height", rollerBody.prop("scrollHeight"));
        memory.val("show");
        setTimeout(() => {
          rollerBody.css("max-height", "none");
          activeTransition = false;
        }, 600);
      } else {
        rollerBody.css("max-height", rollerBody.prop("scrollHeight"));
        memory.val("hide");
        setTimeout(() => {
          rollerBody.css("max-height", 0);
          activeTransition = false;
        }, 10);
      }
    }
  }
});

/**
 * Gives drag and drop functionality. Requires JQuery UI.
 */
function initSortable() {
  $("#sectionAnchor").sortable({ handle: ".handle", update: orderSections });
  $(".block-anchor").sortable({ handle: ".handle", update: orderSections });
  $("#pages-accordion").sortable({ handle: ".handle", update: updateFolders });
}
initSortable();
