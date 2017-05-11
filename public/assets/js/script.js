var categorySelection = [];

(function() {
    $(function() {
        var options = {
            url: function(q) {
                return "/search?q=" + q + "&c=" + JSON.stringify(categorySelection);
            },
            getValue: "name",
            template: {
                type: "custom",
                method: function(value, item) {
                    return "<span class='acitem' style='background-image: url(" + "assets/media/brickdb/" + item.id + ".jpg'>" + item.name + " <span class='listcategory'>" + item.category + "</span></span>";
                }
            },
            highlightPhrase: false,
            requestDelay: 200
        };

        $("#search").easyAutocomplete(options);
        $("[data-popupid]").on("click", togglePopup);
        $("#popup-categories").find(".btn-all").on("click", selectAllCategories);
        $("#popup-categories").find(".btn-none").on("click", deselectAllCategories);

        updateCategories();

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

    function updateCategories() {
        $("#popup-categories").find(".content").empty();


        if (typeof(localStorage) != 'undefined') {
            if (localStorage.getItem("categories") == null) {
                localStorage.setItem("categories", JSON.stringify([]));
            } else {
                categorySelection = JSON.parse(localStorage.getItem("categories"));
            }
        }

        $.ajax({
            url: "/categories",
            method: "GET"
        }).done(function(data) {
            data.forEach(function(item) {
                $newInput = $("<input/>");
                $newInput.attr("type", "checkbox");
                $newInput.attr("id", "category-" + item.id);
                $newInput.attr("name", item.name);
                $newInput.attr("data-category", item.id);
                if ($.inArray(item.id, categorySelection) == -1) $newInput.attr("checked", "checked");

                $newLabel = $("<label></label>");
                $newLabel.attr("for", "category-" + item.id);
                $newLabel.text(item.name);

                $fieldSet = $("<fieldset></fieldset>");

                $fieldSet.append($newInput);
                $fieldSet.append($newLabel);

                $newInput.on("change", changedCategory);

                $("#popup-categories").find(".content").append($fieldSet);
            })
        });

        /*
         <input type="checkbox" id="name" name="name"/>
         <label for="name">Name</label>
         */
    }

    function changedCategory(e) {
        var categoryNum = parseInt($(this).attr("data-category"));

        if (!$(this).is(':checked')) {
            categorySelection.push(categoryNum);
        } else {
            var index = categorySelection.indexOf(categoryNum);

            if (index != -1) {
                categorySelection.splice(index, 1);
            }
        }

        saveCategories();
    }

    function saveCategories() {
        localStorage.setItem("categories", JSON.stringify(categorySelection));
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
    }

    function togglePopup() {
        console.log("ayy");

        if ($(this).attr("data-popupmode") == "show") {
            $($(this).attr("data-popupid")).show();
        } else {
            $($(this).attr("data-popupid")).hide();
        }
    }

    function selectAllCategories() {
        $("#popup-categories").find(".content").find("input").prop("checked", true);
        categorySelection = [];
        saveCategories();
    }

    function deselectAllCategories() {
        $("#popup-categories").find(".content").find("input").prop("checked", false);
        $.each($("#popup-categories").find(".content").find("input"), function(index, value) {
            categorySelection.push(parseInt($(value).attr("data-category")));
        });
        saveCategories();
    }
})();
