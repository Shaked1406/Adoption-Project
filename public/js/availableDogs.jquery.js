$(function () {
  const $form = $("#filtersForm");
  const $wrap = $("#dogsWrap");

  if (!$form.length) return;


  // Clear filters (keeps href as a fallback if JS is disabled)
  $("#clearFilters").on("click", function (e) {
    e.preventDefault();

    $form.find("select").prop("selectedIndex", 0);
    $form.find("input[type='text'], input[type='number']").val("");

    $wrap.addClass("is-loading");
    $form.trigger("submit");
  });

  // Transfer selected dog to another screen using sessionStorage
  $(".js-adopt").on("click", function (e) {
    e.preventDefault();

    const payload = {
      dog_id: $(this).data("dog-id"),
      dog_name: $(this).data("dog-name"),
      shelter_name: $(this).data("shelter-name"),
      ts: Date.now(),
    };

    sessionStorage.setItem("selectedDog", JSON.stringify(payload));
    window.location.href = "/adoption-request"; // no querystring
  });
});
