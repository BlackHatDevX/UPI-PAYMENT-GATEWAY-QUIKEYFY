$(".button").on("click", function () {
	$($(this).data("target")).addClass("page--active");
});

$(".page__close").on("click", function () {
	$(".page").removeClass("page--active");
});
