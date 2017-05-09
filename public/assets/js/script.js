(function() {
    $(function() {
        updateGridview([
            {
                name: "2x2",
                amount: 20
            },
            {
                name: "1x2",
                amount: 10
            }
        ])
    });

    function updateGridview(blockArray) {
        $(".gridview").find(".gbrick").remove();

        $.each(blockArray, function(index, blockData) {
            $(".gridview").append(createGridviewItem(blockData));
        });
    }

    function createGridviewItem(blockData) {
        $newItem = $("<a></a>");
        $newItem.addClass("gbrick");
        $newItem.attr("href", "#");

        $newItemThumb = $("<section></section>");
        $newItemThumb.addClass("gbrick-thumb");

        $newItemThumbAmount = $("<span></span>");
        $newItemThumbAmount.addClass("gbrick-amount");
        $newItemThumbAmount.text(blockData.amount);
        $newItemThumb.append($newItemThumbAmount);

        $brickName = $("<span></span>");
        $brickName.addClass("gbrick-sub");
        $brickName.text(blockData.name);

        $brickPartNum = $("<span></span>");
        $brickPartNum.addClass("gbrick-sub");
        $brickPartNum.text(blockData.name);

        $newItem.append($newItemThumb);
        $newItem.append($brickName);
        $newItem.append($brickPartNum);

        return $newItem;

        /*<a href="#" class="gbrick">
            <section class="gbrick-thumb">
            <span class="gbrick-amount">123456</span>
            </section>
            <span class="gbrick-sub">2x2</span>
        <span class="gbrick-sub">test</span>
            </a>*/
    }

})();