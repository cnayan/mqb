const VarListener = require('./VarListener');

module.exports = function (node) {
    let varListener = new VarListener();
    node.exitRule(varListener);
    return varListener.Var;
};