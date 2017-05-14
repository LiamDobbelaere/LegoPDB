(function(exports){
    exports.StockEntry = function (partid) {
        this.partid = partid;
        this.simplequantities = [];
    };

    exports.SimpleQuantity = function (colorid, quantity) {
        this.colorid = colorid;
        this.quantity = quantity;
    }
})(typeof exports === 'undefined' ? this.lego = {} : exports);