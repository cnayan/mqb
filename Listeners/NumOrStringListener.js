const Listener = require('../antlr/selectListener');
const replaceAll = require('../utils/replaceAll');

const NumOrStringListener = function () {
    this.NumOrText = undefined;
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

NumOrStringListener.prototype = Object.create(Listener.selectListener.prototype);
NumOrStringListener.prototype.constructor = NumOrStringListener;

NumOrStringListener.prototype.exitNum_or_string = function (ctx) {
    let children = ctx.children;
    if (children) {
        let var_ = children[0].toString();

        var isNum = /^((\d*)\.?)?(\d+)$/.test(var_);
        if (isNum) {
            let isFloat = /\./.test(var_);
            isNum = /^\d+$/.test(var_);
            if (isFloat) {
                var_ = parseFloat(var_);
            } else if (isNum) {
                var_ = parseInt(var_);
            }
        } else {
            var_ = var_.replaceAll('\'', '"');
        }

        this.NumOrText = var_;
    }
}

module.exports = NumOrStringListener;