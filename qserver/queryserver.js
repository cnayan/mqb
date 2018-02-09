const buildQueryObject = require('./buildQueryObject');
const buildCountObject = require('./buildCountObject');

module.exports = async function (req, res) {
    let command = req.body;
    if (command && (command.select || command.count)) {
        try {
            let value = {
                db: command.db
            };

            if (command.config) {
                value.config = command.config;
            }

            if (command.select) {
                value.select = _buildQueryOject(command);
            }

            if (command.count) {
                value.count = _buildCountOject(command);
            }

            res.json(value);

        } catch (error) {
            console.error(error);

            res.json({
                return_code: -10,
                text: JSON.stringify(error)
            });
        }

        return;
    }

    res.json({
        return_code: -1,
        text: 'No query given',
        value: undefined
    });
}

function _buildQueryOject(command) {
    let q = [];

    buildQueryObject(command.select, q);

    return q;
}

function _buildCountOject(command) {
    let q = [];

    buildCountObject(command.count, q);

    return q;
}