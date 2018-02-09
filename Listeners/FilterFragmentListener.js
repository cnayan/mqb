const Listener = require('../antlr/selectListener');
// const FiltersFragListener = require('./FiltersFragListener');
const getVar = require('./getVar');
const getRange = require('./getRange');

const FilterFragmentListener = function () {
    this.FragFilter = undefined;
    this.allFilters = undefined;
    Listener.selectListener.call(this); // inherit default listener
    return this;
};

FilterFragmentListener.prototype = Object.create(Listener.selectListener.prototype);
FilterFragmentListener.prototype.constructor = FilterFragmentListener;

FilterFragmentListener.prototype.exitFilterFrag = function (ctx) {
    let children = ctx.children;
    if (children && children.length > 0) {
        if (children[0].constructor.name === 'FiltersFragContext') {
            const FiltersFragListener = require('./FiltersFragListener');
            let listener = new FiltersFragListener();
            children[0].exitRule(listener);
            if (listener.filters) {
                this.allFilters = listener.filters;
            }
        } else {
            let left = getVar(children[0]);

            let index = 1;
            let next = children[index++].toString();
            let negate = false;
            let range = false;
            let like = false;
            let done = false;

            if (next.includes('!')) {
                negate = true;

                if (next === '!') {
                    // range is coming up next
                    next = children[index++].toString();
                }
            }

            if (next === '[') {
                range = true;
            }

            if (!range) {
                let var_ = getVar(children[index]);
                if (/\*/.test(var_) && /[\'\"]/.test(var_)) {
                    like = true;
                }

                this.FragFilter = {
                    left: left,
                    op: like ? (negate ? 'not_like' : 'like') : next,
                    right: var_
                };
            } else {
                let rangeVals = getRange(children[children.length - 2]);

                this.FragFilter = {
                    left: left,
                    op: negate ? 'not' : 'in',
                    right: rangeVals
                };
            }
        }
    }
}

module.exports = FilterFragmentListener;