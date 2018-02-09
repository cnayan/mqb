const Listener = require('../antlr/selectListener');
const Tree = require('antlr4/tree/tree');
const NumOrStringListener = require('./NumOrStringListener');

const check = require('../utils/typecheck');

const VarListener = function () {
    this.Var = undefined;
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

VarListener.prototype = Object.create(Listener.selectListener.prototype);
VarListener.prototype.constructor = VarListener;

VarListener.prototype.exitVariable = function (ctx) {
    let children = ctx.children;
    if (children) {
        let child = children[0];

        this.Var = child.toString();

        // if not terminal node...
        if (!check.is(child, Tree.TerminalNodeImpl)) {
            let listener = new NumOrStringListener();
            child.exitRule(listener);
            if (listener.NumOrText) {
                this.Var = listener.NumOrText;
            }
        }
    }
}

module.exports = VarListener;