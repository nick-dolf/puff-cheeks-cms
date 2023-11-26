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