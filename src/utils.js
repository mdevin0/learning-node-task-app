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

const validateEnvironmentVariables = () => {
    const requiredVars = ['BCRYPT_ROUNDS', 'DATABASE_URL', 'JWT_SIGN', 'JWT_TTL', 'PORT', 
            'SENDGRID_KEY', 'SENDGRID_FROM'];
    const envVars = Object.keys(process.env);
    const missingVars = requiredVars.filter((requiredVar) => !envVars.includes(requiredVar));
    if(missingVars.length > 0){
        console.error(`The application cannot start if the missing required variables are not set: ${missingVars.join(' ')}`);
        console.error('Shutting the server down...')
        process.exit(666);
    }

}

module.exports = {
    getInvalidFields,
    getProperties,
    validateEnvironmentVariables
};