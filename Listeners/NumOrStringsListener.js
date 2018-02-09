const Listener = require('../antlr/selectListener');
const NumOrStringListener = require('./NumOrStringListener');

const NumOrStringsListener = function () {
    this.RangeFilter = undefined;
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

NumOrStringsListener.prototype = Object.create(Listener.selectListener.prototype);
NumOrStringsListener.prototype.constructor = NumOrStringsListener;

NumOrStringsListener.prototype.exitNum_or_strings = function (ctx) {
    let children = ctx.children;
    if (children) {
        this.RangeFilter = [];

        children = children.filter(c => c.toString() !== ',');
        for (let index = 0; index < children.length; index++) {
            const c = children[index];

            let listener = new NumOrStringListener();
            c.exitRule(listener);
            if (listener.NumOrText) {
                this.RangeFilter.push(listener.NumOrText);
            } else {
                this.RangeFilter.push(var_);
            }
        }
    }
}

module.exports = NumOrStringsListener;