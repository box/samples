/**
 * @fileoverview ErrorParser manages transformation for error messages caught from external APIs into
 * skill specific error message.
 */

/**
 * Module dependencies
 */
const { SkillsErrorEnum } = require('./skills-kit');

class ErrorParser {
    constructor(error) {
        this.error = error;

        // for known errors set the final skillsErrorCode for error metadata card value as it is
        this.skillsErrorCode =
            this.error === SkillsErrorEnum.INVALID_FILE_SIZE.value ||
            this.error === SkillsErrorEnum.INVALID_FILE_FORMAT.value ||
            this.error === SkillsErrorEnum.INVALID_EVENT.value
                ? this.error
                : SkillsErrorEnum.UNKNOWN.value;
    }

    parseBoxSkillsInvocationError() {
        // error in skill invocation calls for saving metadata cards
        if (this.error.includes('Unexpected API Response')) {
            // internal server errors are reserved to something going wrong run-time on skill's own lambda/server
            // it should not be extended to errors happening with external MLP provider
            // create a seperate function to be chained for MLP errors.

            this.skillsErrorCode = SkillsErrorEnum.INTERNAL_SERVER.value;
        }

        return this;
    }

    getSkillsErrorCode() {
        return this.skillsErrorCode;
    }
}

module.exports = ErrorParser;
