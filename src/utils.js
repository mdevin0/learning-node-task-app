require('./db/mongoose');

const getInvalidFields = (fields, model) => {
    const modelFields = getProperties(model);
    return fields.filter((field) => !modelFields.includes(field));
};

const getProperties = (model) => {
    const paths = model.schema.paths;
    const properties = Object.keys(paths).filter((property) => !(property === '_id' || property === '__v'));
    return properties;

}

module.exports = {
    getInvalidFields,
    getProperties
};