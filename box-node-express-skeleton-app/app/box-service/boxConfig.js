const fs = require('fs');
const path = require('path');
const EOL = require('os').EOL;
const _ = require('lodash');
const FILENAME = "config.json";
const CONFIG_PROPERTY_NAMES = {
    BOX_APP_SETTINGS: "boxAppSettings",
    CLIENT_ID: "clientID",
    CLIENT_SECRET: "clientSecret",
    APP_AUTH: "appAuth",
    PUBLIC_KEY_ID: "publicKeyID",
    PRIVATE_KEY: "privateKey",
    PASSPHRASE: "passphrase",
    ENTERPRISE_ID: "enterpriseID",
    WEBHOOKS: "webhooks",
    PRIMARY_KEY: "primaryKey",
    SECONDARY_KEY: "secondaryKey",
    PRIVATE_KEY_FILENAME: "privateKeyFilename",
}
const ENVIRONMENT_VARIABLE_NAME = {
    CLIENT_ID: "BOX_CLIENT_ID",
    CLIENT_SECRET: "BOX_CLIENT_SECRET",
    PUBLIC_KEY_ID: "BOX_PUBLIC_KEY_ID",
    PRIVATE_KEY: "BOX_PRIVATE_KEY",
    PRIVATE_KEY_FILENAME: "BOX_PRIVATE_KEY_FILENAME",
    PASSPHRASE: "BOX_PRIVATE_KEY_PASSPHRASE",
    PRIMARY_KEY: "BOX_WEBHOOKS_PRIMARY_KEY",
    SECONDARY_KEY: "BOX_WEBHOOKS_SECONDARY_KEY",
    ENTERPRISE_ID: "BOX_ENTERPRISE_ID",
}

module.exports = class BoxConfig {
    constructor(options, filename = FILENAME) {
        options = options || {};
        this.privateKeyValidationError = "There was an error with the format of your private key file.";

        if (options.useEnvironmentVariables) {
            validateEnvironmentVariables();
            setConfigWithEnvironmentVariables(this);
        } else if (checkForRequiredProperties(options)) {
            setConfigWithOptions(this, options);
        } else {
            let config = JSON.parse(fs.readFileSync(filename));
            validateBoxConfig(config);
            setConfigWithConfigFile(this, config);
            if (options.ignorePrivateKey) {
                return;
            } else {
                let privateKey = config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PRIVATE_KEY];
                if (validatePrivateKeyHeaders(privateKey)) {
                    this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
                } else if (_.isString(privateKey)) {
                    privateKey = fs.readFileSync(privateKey).toString();
                    if (validatePrivateKeyHeaders(privateKey)) {
                        this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
                    } else {
                        throw new Error("There was an error with the format of your private key file.");
                    }
                }
            }
        }
    }

    getConfig() {
        let config = {};
        if (this[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID]) {
            config[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID] = this[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID];
        }

        if (this[CONFIG_PROPERTY_NAMES.WEBHOOKS]) {
            config[CONFIG_PROPERTY_NAMES.WEBHOOKS] = {};
            if (this[CONFIG_PROPERTY_NAMES.PRIMARY_KEY]) {
                config[CONFIG_PROPERTY_NAMES.WEBHOOKS][CONFIG_PROPERTY_NAMES.PRIMARY_KEY] = this[CONFIG_PROPERTY_NAMES.PRIMARY_KEY];
            }
            if (this[CONFIG_PROPERTY_NAMES.SECONDARY_KEY]) {
                config[CONFIG_PROPERTY_NAMES.WEBHOOKS][CONFIG_PROPERTY_NAMES.SECONDARY_KEY] = this[CONFIG_PROPERTY_NAMES.SECONDARY_KEY];
            }
        }

        config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS] = {};
        config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.CLIENT_ID] = this[CONFIG_PROPERTY_NAMES.CLIENT_ID];
        config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.CLIENT_SECRET] = this[CONFIG_PROPERTY_NAMES.CLIENT_SECRET];
        config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH] = {};
        if (this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY]) {
            config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY];
        }
        if (this[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID]) {
            config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID] = this[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID];
        }
        if (this[CONFIG_PROPERTY_NAMES.PASSPHRASE]) {
            config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PASSPHRASE] = this[CONFIG_PROPERTY_NAMES.PASSPHRASE];
        }
        return config;
    }

    setConfig(config, isFilename = false, readPrivateKey = false) {
        config = config || {};
        let privateKey;
        if (isFilename) {
            config = JSON.parse(fs.readFileSync(config));
            validateBoxConfig(config);
            setConfigWithConfigFile(this, config);
            if (readPrivateKey && config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PRIVATE_KEY]) {
                privateKey = fs.readFileSync(path.join(__dirname, config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PRIVATE_KEY])).toString();
            }

            if (privateKey) {
                if (!validatePrivateKeyHeaders(privateKey)) {
                    throw new Error(this.privateKeyValidationError);
                }
                this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
            }
        } else {
            if (config[CONFIG_PROPERTY_NAMES.CLIENT_ID]) {
                this[CONFIG_PROPERTY_NAMES.CLIENT_ID] = config[CONFIG_PROPERTY_NAMES.CLIENT_ID];
            }
            if (config[CONFIG_PROPERTY_NAMES.CLIENT_SECRET]) {
                this[CONFIG_PROPERTY_NAMES.CLIENT_SECRET] = config[CONFIG_PROPERTY_NAMES.CLIENT_SECRET];
            }
            if (config[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID]) {
                this[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID] = config[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID];
            }

            if (readPrivateKey) {
                if (config[CONFIG_PROPERTY_NAMES.PRIVATE_KEY]) {
                    privateKey = fs.readFileSync(config[CONFIG_PROPERTY_NAMES.PRIVATE_KEY]);
                }
            } else {
                if (config[CONFIG_PROPERTY_NAMES.PRIVATE_KEY]) {
                    this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = config[CONFIG_PROPERTY_NAMES.PRIVATE_KEY];
                }
            }
            if (privateKey) {
                if (!validatePrivateKeyHeaders(privateKey)) {
                    throw new Error(this.privateKeyValidationError);
                }
                this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
            }

            if (config[CONFIG_PROPERTY_NAMES.PASSPHRASE]) {
                this[CONFIG_PROPERTY_NAMES.PASSPHRASE] = config[CONFIG_PROPERTY_NAMES.PASSPHRASE];
            }
        }
    }

    async setPrivateKey(privateKeyPromise) {
        if (privateKeyPromise) {
            let privateKey = await privateKeyPromise;
            if (!validatePrivateKeyHeaders(privateKey)) {
                throw new Error(this.privateKeyValidationError);
            }
            this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
        } else {
            if (this.retrievePrivateKey && _.isFunction(this.retrievePrivateKey)) {
                let privateKey = await this.retrievePrivateKey();
                if (!validatePrivateKeyHeaders(privateKey)) {
                    throw new Error(this.privateKeyValidationError);
                }
                this[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
            } else {
                throw new Error("You must pass a function that resolves to a promise as a parameter to the setPrivateKey method or set a function that resolves to a promise with the retrievePrivateKey option when creating a new BoxConfig.");
            }
        }
    }
}

function setConfigWithEnvironmentVariables(BoxConfig) {
    BoxConfig[CONFIG_PROPERTY_NAMES.CLIENT_ID] = process.env[ENVIRONMENT_VARIABLE_NAME.CLIENT_ID];
    BoxConfig[CONFIG_PROPERTY_NAMES.CLIENT_SECRET] = process.env[ENVIRONMENT_VARIABLE_NAME.CLIENT_SECRET];
    BoxConfig[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID] = process.env[ENVIRONMENT_VARIABLE_NAME.PUBLIC_KEY_ID];

    if (!BoxConfig.retrievePrivateKey) {
        let privateKey;
        if (process.env[ENVIRONMENT_VARIABLE_NAME.PRIVATE_KEY_FILENAME]) {
            privateKey = fs.readFileSync(process.env[ENVIRONMENT_VARIABLE_NAME.PRIVATE_KEY_FILENAME]).toString();
        } else {
            privateKey = process.env[ENVIRONMENT_VARIABLE_NAME.PRIVATE_KEY];
        }
        if (validatePrivateKeyHeaders(privateKey)) {
            BoxConfig[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
        } else {
            throw new Error("There was an error with the format of your private key file.");
        }
    }

    if (process.env[ENVIRONMENT_VARIABLE_NAME.PASSPHRASE]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.PASSPHRASE] = process.env[ENVIRONMENT_VARIABLE_NAME.PASSPHRASE];
    }

    if (process.env[ENVIRONMENT_VARIABLE_NAME.ENTERPRISE_ID]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID] = process.env[ENVIRONMENT_VARIABLE_NAME.ENTERPRISE_ID];
    }

    if (process.env[ENVIRONMENT_VARIABLE_NAME.PRIMARY_KEY]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.PRIMARY_KEY] = process.env[ENVIRONMENT_VARIABLE_NAME.PRIMARY_KEY];
    }

    if (process.env[ENVIRONMENT_VARIABLE_NAME.SECONDARY_KEY]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.SECONDARY_KEY] = process.env[ENVIRONMENT_VARIABLE_NAME.SECONDARY_KEY];
    }
}

function setConfigWithOptions(BoxConfig, options) {
    BoxConfig[CONFIG_PROPERTY_NAMES.CLIENT_ID] = options[CONFIG_PROPERTY_NAMES.CLIENT_ID];
    BoxConfig[CONFIG_PROPERTY_NAMES.CLIENT_SECRET] = options[CONFIG_PROPERTY_NAMES.CLIENT_SECRET];
    BoxConfig[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID] = options[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID];

    if (!BoxConfig.retrievePrivateKey) {
        let privateKey;
        if (options[CONFIG_PROPERTY_NAMES.PRIVATE_KEY_FILENAME]) {
            privateKey = fs.readFileSync(options[CONFIG_PROPERTY_NAMES.PRIVATE_KEY_FILENAME]);
        } else {
            privateKey = options[CONFIG_PROPERTY_NAMES.PRIVATE_KEY];
        }
        if (validatePrivateKeyHeaders(privateKey)) {
            BoxConfig[CONFIG_PROPERTY_NAMES.PRIVATE_KEY] = privateKey;
        } else {
            throw new Error("There was an error with the format of your private key file.");
        }
    }

    if (options[CONFIG_PROPERTY_NAMES.PASSPHRASE]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.PASSPHRASE] = options[CONFIG_PROPERTY_NAMES.PASSPHRASE];
    }

    if (options[ENVIRONMENT_VARIABLE_NAME.ENTERPRISE_ID]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID] = process.env[ENVIRONMENT_VARIABLE_NAME.ENTERPRISE_ID];
    }

    if (options[ENVIRONMENT_VARIABLE_NAME.PRIMARY_KEY]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.PRIMARY_KEY] = options[ENVIRONMENT_VARIABLE_NAME.PRIMARY_KEY];
    }

    if (options[ENVIRONMENT_VARIABLE_NAME.SECONDARY_KEY]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.SECONDARY_KEY] = options[ENVIRONMENT_VARIABLE_NAME.SECONDARY_KEY];
    }
}

function setConfigWithConfigFile(BoxConfig, config) {
    BoxConfig[CONFIG_PROPERTY_NAMES.CLIENT_ID] = config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.CLIENT_ID];
    BoxConfig[CONFIG_PROPERTY_NAMES.CLIENT_SECRET] = config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.CLIENT_SECRET];
    BoxConfig[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID] = config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID];
    if (config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PASSPHRASE]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.PASSPHRASE] = config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PASSPHRASE];
    }

    if (config[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID] = config[CONFIG_PROPERTY_NAMES.ENTERPRISE_ID];
    }

    if (config[CONFIG_PROPERTY_NAMES.WEBHOOKS] && config[CONFIG_PROPERTY_NAMES.WEBHOOKS][CONFIG_PROPERTY_NAMES.PRIMARY_KEY]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.PRIMARY_KEY] = config[CONFIG_PROPERTY_NAMES.WEBHOOKS][CONFIG_PROPERTY_NAMES.PRIMARY_KEY];
    }

    if (config[CONFIG_PROPERTY_NAMES.WEBHOOKS] && config[CONFIG_PROPERTY_NAMES.WEBHOOKS][CONFIG_PROPERTY_NAMES.SECONDARY_KEY]) {
        BoxConfig[CONFIG_PROPERTY_NAMES.SECONDARY_KEY] = config[CONFIG_PROPERTY_NAMES.WEBHOOKS][CONFIG_PROPERTY_NAMES.SECONDARY_KEY];
    }
}

function checkForRequiredProperties(options) {
    return options[CONFIG_PROPERTY_NAMES.CLIENT_ID] && options[CONFIG_PROPERTY_NAMES.CLIENT_SECRET] && options[CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID]
}

function validatePrivateKeyHeaders(privateKey) {
    const PRIVATE_KEY_HEADER = "-----BEGIN ENCRYPTED PRIVATE KEY-----";
    const PRIVATE_KEY_FOOTER = "-----END ENCRYPTED PRIVATE KEY-----";
    try {
        let lines = privateKey.split(EOL);
        return _.startsWith(privateKey, PRIVATE_KEY_HEADER) && _.isEqualWith(lines[lines.length - 2], PRIVATE_KEY_FOOTER);
    } catch (e) {
        return false;
    }
}

function validateEnvironmentVariables() {
    if (!process.env[ENVIRONMENT_VARIABLE_NAME.CLIENT_ID]) {
        throw new Error(`Please set the ${ENVIRONMENT_VARIABLE_NAME.CLIENT_ID} environment variable.`);
    }
    if (!process.env[ENVIRONMENT_VARIABLE_NAME.CLIENT_SECRET]) {
        throw new Error(`Please set the ${ENVIRONMENT_VARIABLE_NAME.CLIENT_SECRET} environment variable.`);
    }
    if (!process.env[ENVIRONMENT_VARIABLE_NAME.PUBLIC_KEY_ID]) {
        throw new Error(`Please set the ${ENVIRONMENT_VARIABLE_NAME.PUBLIC_KEY_ID} environment variable.`);
    }
}

function validateBoxConfig(config) {
    if (!config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS]) {
        throw new Error(`Configuration must have a ${CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS} property.`);
    }
    if (!config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.CLIENT_ID]) {
        throw new Error(`Configuration must have a ${CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS}.${CONFIG_PROPERTY_NAMES.CLIENT_ID} property.`);
    }
    if (!config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.CLIENT_SECRET]) {
        throw new Error(`Configuration must have a ${CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS}.${CONFIG_PROPERTY_NAMES.CLIENT_SECRET} property.`);
    }
    if (!config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH]) {
        throw new Error(`Configuration must have a ${CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS}.${CONFIG_PROPERTY_NAMES.APP_AUTH} property.`);
    }
    if (!config[CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS][CONFIG_PROPERTY_NAMES.APP_AUTH][CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID]) {
        throw new Error(`Configuration must have a ${CONFIG_PROPERTY_NAMES.BOX_APP_SETTINGS}.${CONFIG_PROPERTY_NAMES.APP_AUTH}.${CONFIG_PROPERTY_NAMES.PUBLIC_KEY_ID} property.`);
    }
}