const antlr4 = require('antlr4');
const L = require('../antlr/selectLexer');
const P = require('../antlr/selectParser');
const SelectListener = require('../Listeners/SelectListener');

module.exports = function (selects, q) {
  if (!(selects instanceof Array) && selects.length > 0) {
    return;
  }

  selects.forEach(input => {
    let listener = _getParsedSelect(input);
    _buildQuery(q, listener);
  });
}

function _getParsedSelect(input) {
  let listener = new SelectListener();

  var chars = new antlr4.InputStream(input);
  var lexer = new L.selectLexer(chars);
  var tokens = new antlr4.CommonTokenStream(lexer);
  var parser = new P.selectParser(tokens);
  parser.buildParseTrees = true;
  var tree = parser.select();

  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

  return listener;
}

function _buildQuery(q, listener) {
  let selectQuery = {};
  selectQuery[listener.tableName] = {}
  let table = selectQuery[listener.tableName];
  if (listener.fields && listener.fields.length > 0) {
    table.fields = listener.fields;
  }

  if (listener.num !== undefined && listener.num !== -1) {
    table.limit = listener.num;
  }

  if (listener.order_by !== undefined && listener.order_by.length > 0) {
    table.order_by = listener.order_by;
  }

  if (listener.filters !== undefined && listener.filters.length > 0) {
    table.filter = [];
    listener.filters.forEach(filter => table.filter.push(_extractOrFilters(filter)));
  }

  q = q || [];
  q.push(selectQuery);
}

function _extractOrFilters(filter) {
  let new_filter = {};

  if (filter.or) {
    new_filter.or = [];
    filter.or.forEach(f => new_filter.or.push(_extractOrFilters(f)));
  } else if (filter.all) {
    new_filter.all = [];
    filter.all.forEach(f => new_filter.all.push(_extractOrFilters(f)));
  } else {
    _setNewFilter(filter, new_filter);
  }

  return new_filter;
}

function _setNewFilter(filter, new_filter) {
  let new_f = new_filter[filter.left] = {};
  let op = _getOp(filter, new_filter);
  if (!op) {
    throw Error('Operator undefined', filter);
  }

  new_f[op] = filter.right;
}

// function _setNewOrFilter(filter, new_filter) {
//   let new_f = new_filter[filter.left] = {};
//   let op = _getOp(filter, new_filter);
//   if (!op) {
//     throw Error('Operator undefined', filter);
//   }

//   new_f[op] = filter.right;
// }

function _getOp(filter, new_filter) {
  let op = undefined;
  switch (filter.op) {
    case '>=':
      op = 'eq'
      new_filter[filter.left][op] = filter.right;
    case '>':
      op = 'gt'
      break;
    case '<=':
      op = 'eq'
      new_filter[filter.left][op] = filter.right;
    case '<':
      op = 'lt'
      break;
    case '=':
      op = 'eq'
      break;
    case '!=':
      op = 'not_eq'
      break;
    case 'in':
    case 'not':
    case 'not_like':
    case 'like':
      op = filter.op
      break;
  }

  return op;
}