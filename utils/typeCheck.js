exports = module.exports = {}

exports.is = (o, T) => {
    return o.constructor.name === T.name;
    // return type(o) === type(T.prototype);
}

// function type(obj) {
//     var text = Function.prototype.toString.call(obj.constructor)
//     return text.match(/function (.*)\(/)[1]
// }