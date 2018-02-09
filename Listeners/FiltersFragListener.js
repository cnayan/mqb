const Listener = require('../antlr/selectListener');
const FilterListener = require('./FilterListener');

const FiltersFragListener = function () {
    this.filters = [];
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

FiltersFragListener.prototype = Object.create(Listener.selectListener.prototype);
FiltersFragListener.prototype.constructor = FiltersFragListener;

FiltersFragListener.prototype.exitFiltersFrag = function (ctx) {
    let children = ctx.children;
    if (children) {
        children = children.splice(1, children.length - 2);
        children = children.filter(c => c.toString() !== ',');
        for (let c of children) {
            let listener = new FilterListener();
            c.exitRule(listener);
            if (listener.OrFilters) {
                if (listener.OrFilters.length > 1) {
                    this.filters.push({
                        or: listener.OrFilters
                    });
                } else {
                    this.filters.push(...listener.OrFilters);
                }
            }
        }
    }
}

module.exports = FiltersFragListener;