var categorySelection = [];

(function() {
    var loadedColors = [];

    $(function() {
        var options = {
            url: function(q) {
                return "/search?q=" + q + "&c=" + JSON.stringify(categorySelection);
            },
            getValue: "name",
            template: {
                type: "custom",
                method: function(value, item) {
                    var backgroundStyle = "url(" + "assets/media/brickdb/" + item.id + ".jpg)";

                    if (!item.hasImage) {
                        backgroundStyle = ""; //Prevent spamming get requests for images that don't exist
                    }

                    return "<span class='acitem' style='background-image:" + backgroundStyle + "'>"
                        + item.name + " <span class='listpartid'>(" + item.id + ")</span>" + " <span class='listcategory'>" + item.category + "</span></span>";
                }
            },
            list: {
                onClickEvent: function() {
                    console.log($("#search").getSelectedItemData());
                },
                maxNumberOfElements: 10
            },
            highlightPhrase: false,
            requestDelay: 200
        };

        $("#search").easyAutocomplete(options);
        updateColorpickers();
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

    function updateColorpickers() {
        $.ajax({
            method: "GET",
            url: "/colors"
        }).done(function (data) {
            var colorIds = [];
            var colorValues = [];

            loadedColors = data;

            data.forEach(function(item) {
                colorIds.push(item.id);

                if (item.transparent) {
                    colorValues.push("#ac" + item.hex.substring(1));
                } else {
                    colorValues.push(item.hex);
                }
            });

            $("#popup-colorscroll ul").empty();
            loadedColors.forEach(function(item) {
                $newLi = $("<li></li>");
                $newLi.attr("style", "background-color: " + item.hex + ";");
                $newLi.text(item.name);

                $("#popup-colorscroll ul").append($newLi);
            });

            $(".lego-color-picker").spectrum({
                showAlpha: true,
                showPalette: true,
                showPaletteOnly: true,
                allowEmpty: false,
                preferredFormat: "hex",
                color: colorValues[0],
                palette: [colorValues],
                change: function(color) {
                    loadedColors.forEach(function(item) {
                        var transparentMatch = (color._a < 1 && item.transparent) ||  (color._a > 0.99 && !item.transparent);

                        if (item.hex.toLowerCase() == color.toHexString().toLowerCase() && transparentMatch) {
                            console.log(item.name);
                        }
                    });
                }
            });

            console.log($(".lego-color-picker").spectrum("get"));
        });
    }
})();
