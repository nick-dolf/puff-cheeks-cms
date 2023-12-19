function updateFolders() {
  const folders = $("input[name='folders'").serialize()

  $.ajax({
    url: adminUrl + "page-folders",
    type: "PUT",
    data: folders,
  })
}

function updatePages() {
  const pages = $("input[name='pages'")

  let data = { }
  data.links = [];
  data.folders = [];
  pages.each( function(index) {
    data.links.push(this.value)
    data.folders.push(this.closest(".roller").children[0].value)
  })

  $.ajax({
    url: adminUrl + "pages",
    type: "PUT",
    data: $.param(data),
  })
}