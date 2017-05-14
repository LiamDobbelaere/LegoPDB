(function () {
    var categorySelection = [];
    var loadedColors = [];

    const easyAutocompleteDefaults = {
        getValue: "name",
        template: {
            type: "custom",
            method: legoListItemTemplate
        },
        list: {
            maxNumberOfElements: 10
        },
        highlightPhrase: false,
        requestDelay: 200,
        placeholder: "brick 2x2"
    };

    $(function () {
        $("#search-parts").easyAutocomplete(new EasyAutocompleteOptions(easyAutocompleteDefaults, function (q) {
            return "/api/search?q=" + q + "&c=" + JSON.stringify(categorySelection);
        }, partSearchClickhandler));

        //Generic popup handler
        $("[data-popupid]").on("click", togglePopup);

        $("#popup-categories").find(".btn.all").on("click", selectAllCategories).parent()
            .find(".btn.none").on("click", deselectAllCategories);
        $(".add-part-button").on("click", initializeAddPart);
        $("#add-part-confirm").on("click", addPartToStock);

        updateColorpickers();
        updateCategories();
        updateGridview();
    });

    //Small helper function for making autocomplete options
    function EasyAutocompleteOptions(defaults, queryFunction, clickHandler) {
        var out = $.extend(true, {}, defaults);

        out.url = queryFunction;
        out.list.onClickEvent = clickHandler;

        return out;
    }

    //Click handler for when you select a part in the search for the add part popup
    function partSearchClickhandler() {
        var selectedBrick = $("#search-parts").getSelectedItemData();
        var backgroundStyle = "url(" + "assets/media/brickdb/" + selectedBrick.id + ".jpg)";

        if (!selectedBrick.hasImage) {
            backgroundStyle = ""; //Prevent spamming get requests for images that don't exist
        }
        
        $("#brick-display-small").show().css("background-image", backgroundStyle)
            .find(".part-name").text(selectedBrick.name).parent().find(".part-number").text(selectedBrick.id).parent().show();

        $("#add-part-confirm").show();
    }

    //Item template to use for the autocomplete list (used in the default easyautocomplete options)
    function legoListItemTemplate(value, part) {

        var backgroundStyle = "url(" + "assets/media/brickdb/" + part.id + ".jpg)";

        if (!part.hasImage) {
            backgroundStyle = ""; //Prevent spamming get requests for images that don't exist
        }

        return "<span class='acitem' style='background-image:" + backgroundStyle + "'>"
            + part.name + " <span class='listpartid'>(" + part.id + ")</span>" +
            " <span class='listcategory'>" + part.category + "</span></span>";
    }

    //Resets some values for when you open the add part popup
    function initializeAddPart() {
        $("#search-parts").val("").focus();
        $("#add-part-quantity").val("1");
        $("#add-part-confirm").hide();
        $("#brick-display-small").hide();
    }

    //Confirmation button in the add part popup
    function addPartToStock() {
        var selection = {
            id: $("#popup-addpart").find(".part-number").text(),
            colorid: colorLookup($(".lego-color-picker").val()).id,
            amount: parseInt($("#add-part-quantity").val())
        };

        var newStockEntry = new lego.StockEntry(selection.id);
        newStockEntry.simplequantities.push(new lego.SimpleQuantity(selection.colorid, selection.amount));

        $.ajax({
            method: "GET",
            url: "/api/stock/add",
            data: {
                data: JSON.stringify(newStockEntry)
            }
        }).done(function (data) {
            $("#popup-addpart").hide();
            updateGridview();
        });
    }

    //Updates the stock overview
    function updateGridview() {
        $(".gridview").find(".gbrick").remove();

        $.ajax({
            method: "GET",
            url: "/api/stock/get"
        }).done(function(stockArray) {
            $.each(stockArray, function (index, stockItem) {
                $(".gridview").append(createGridviewItem(stockItem));
            });
        });
    }

    //Updates the category list with categories from the server, also remembers the selected categories
    //NOTE: The selection is inverse, meaning any categories in the categorySelection array are EXCLUDED from the search
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
            url: "/api/categories",
            method: "GET"
        }).done(function (data) {
            data.forEach(function (category) {
                $newInput = $("<input/>");
                $newInput.attr("type", "checkbox");
                $newInput.attr("id", "category-" + category.id);
                $newInput.attr("name", category.name);
                $newInput.attr("data-category", category.id);
                if ($.inArray(category.id, categorySelection) == -1) $newInput.attr("checked", "checked");

                $newLabel = $("<label></label>");
                $newLabel.attr("for", "category-" + category.id);
                $newLabel.text(category.name);

                $fieldSet = $("<fieldset></fieldset>");

                $fieldSet.append($newInput);
                $fieldSet.append($newLabel);

                $newInput.on("change", changedCategory);

                $("#popup-categories").find(".content").append($fieldSet);
            })
        });
    }

    //Updates the colorpickers on the page for picking lego colors
    function updateColorpickers() {
        $.ajax({
            method: "GET",
            url: "/api/simplecolors"
        }).done(function (data) {
            var colorIds = [];
            var colorValues = [];

            loadedColors = data;

            data.forEach(function (color) {
                colorIds.push(color.id);

                if (color.transparent) {
                    colorValues.push("#ac" + color.hex.substring(1));
                } else {
                    colorValues.push(color.hex);
                }
            });

            $(".lego-color-picker").spectrum({
                showAlpha: true,
                showPalette: true,
                showPaletteOnly: true,
                allowEmpty: false,
                preferredFormat: "hex",
                color: colorValues[0],
                palette: [colorValues],
                change: function (color) {
                    $(".lego-color-picker").spectrum("hide");
                }
            });
        });
    }

    //Triggers when a category is changed, used for modifying the category selection array
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

    //Simple method but used in multiple places
    function saveCategories() {
        localStorage.setItem("categories", JSON.stringify(categorySelection));
    }

    //Makes a gridview item for the stock
    function createGridviewItem(stockItem) {
        $newItem = $("<a></a>");
        $newItem.addClass("gbrick");
        $newItem.attr("href", "#");

        $newItemThumb = $("<section></section>");
        $newItemThumb.addClass("gbrick-thumb");
        $newItemThumb.css("background-image", "url('assets/media/brickdb/" + stockItem.brick.id + ".jpg')");

        $newItemThumbAmount = $("<span></span>");
        $newItemThumbAmount.addClass("gbrick-amount");
        $newItemThumbAmount.text(stockItem.totalcount);
        $newItemThumb.append($newItemThumbAmount);

        $brickName = $("<span></span>");
        $brickName.addClass("gbrick-sub");
        $brickName.text(stockItem.brick.name);

        $brickPartNum = $("<span></span>");
        $brickPartNum.addClass("gbrick-sub");
        $brickPartNum.text(stockItem.brick.id);

        $newItem.append($newItemThumb);
        $newItem.append($brickName);
        $newItem.append($brickPartNum);

        return $newItem;
    }

    function togglePopup() {
        if ($(this).attr("data-popupmode") == "show") {
            $("#" + $(this).attr("data-popupid")).show();
        } else {
            $("#" + $(this).attr("data-popupid")).hide();
        }
    }

    function selectAllCategories() {
        $("#popup-categories").find(".content").find("input").prop("checked", true);
        categorySelection = [];
        saveCategories();
    }

    function deselectAllCategories() {
        $("#popup-categories").find(".content").find("input").prop("checked", false);
        $.each($("#popup-categories").find(".content").find("input"), function (index, value) {
            categorySelection.push(parseInt($(value).attr("data-category")));
        });
        saveCategories();
    }

    //Checks which color object a certain hex code matches
    function colorLookup(hex) {
        var out = null;

        loadedColors.forEach(function (color) {
            if (color.hex.toLowerCase() == hex.toLowerCase()) {
                out = color;
            }
        });

        return out;
    }
})();
