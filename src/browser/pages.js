const adminUrl = window.location.href.replace("/pages", "");

function updateFolders() {
  const folders = $("input[name='folders'").serialize()

  $.ajax({
    url: adminUrl + "/page-folders",
    type: "PUT",
    data: folders,
  })
}