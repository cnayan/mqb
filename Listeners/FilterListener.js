const Listener = require('../antlr/selectListener');
const getVar = require('./getVar');
const getRange = require('./getRange');
const FilterFragmentListener = require('./FilterFragmentListener');

const FilterListener = function () {
    this.OrFilters = [];
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

FilterListener.prototype = Object.create(Listener.selectListener.prototype);
FilterListener.prototype.constructor = FilterListener;

FilterListener.prototype.exitFilter = function (ctx) {
    let children = ctx.children;
    if (children) {
        children = children.filter(c => c.toString() !== '|');

        for (let c of children) {
            let listener = new FilterFragmentListener();
            c.exitRule(listener);
            if (listener.allFilters) {
                if (listener.allFilters.length > 1) {
                    this.OrFilters.push({
                        all: listener.allFilters
                    });
                } else {
                    this.OrFilters.push(...listener.allFilters);
                }
            } else {
                this.OrFilters.push(listener.FragFilter);
            }
        }
    }
};

module.exports = FilterListener;