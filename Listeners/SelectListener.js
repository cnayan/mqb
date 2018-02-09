const Listener = require('../antlr/selectListener');
const FiltersFragListener = require('./FiltersFragListener');

const SelectListener = function () {
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

SelectListener.prototype = Object.create(Listener.selectListener.prototype);
SelectListener.prototype.constructor = SelectListener;

// Enter a parse tree produced by selectParser#num.
SelectListener.prototype.enterNum = function (ctx) {
    this.num = undefined;
};

// Exit a parse tree produced by selectParser#num.
SelectListener.prototype.exitNum = function (ctx) {
    let children = ctx.children;
    if (children) {
        this.num = parseInt(children[0].toString());
    }
};

// Enter a parse tree produced by selectParser#table.
SelectListener.prototype.enterTable = function (ctx) {};

// Exit a parse tree produced by selectParser#table.
SelectListener.prototype.exitTable = function (ctx) {
    this.tableName = ctx.children[0].toString();
};

SelectListener.prototype.enterFilters = function (ctx) {
    this.filters = [];
}

SelectListener.prototype.exitFilters = function (ctx) {
    let children = ctx.children;
    if (children) {
        let listener = new FiltersFragListener();
        children[0].exitRule(listener);
        if (listener.filters) {
            if (listener.filters.length > 1) {
                this.filters.push({
                    all: listener.filters
                });
            } else {
                this.filters.push(...listener.filters);
            }
        }
    }
};

SelectListener.prototype.enterOrder_by = function (ctx) {
    this.order_by = [];
}

SelectListener.prototype.exitOrder_by = function (ctx) {
    let children = ctx.children;
    if (children) {
        children = children.splice(1, children.length - 2);
        children.filter(c => c.toString() !== ',')
            .forEach(c => {
                let name = c.toString();
                if (!this.order_by.includes(name)) {
                    this.order_by.push(name);
                }
            });
    }
};

SelectListener.prototype.enterFields = function (ctx) {
    this.fields = [];
}

SelectListener.prototype.exitFields = function (ctx) {
    let children = ctx.children;
    if (children) {
        children = children.splice(1, children.length - 2);
        children.filter(c => c.toString() !== ',')
            .forEach(c => {
                let name = c.toString();
                if (!this.fields.includes(name)) {
                    this.fields.push(name);
                }
            });
    }
};

module.exports = SelectListener;