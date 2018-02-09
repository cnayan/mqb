const NumOrStringsListener = require('./NumOrStringsListener');

module.exports = function (num_or_strings_node) {
    if (num_or_strings_node) {
        let listener = new NumOrStringsListener();
        num_or_strings_node.exitRule(listener);
        return listener.RangeFilter;
    }
};