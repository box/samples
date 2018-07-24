/**
 * Some eslint rules are disabled for this file, since the code is written to be
 * backward compatible with Node 4.0 and Box-node-SDK
 */

/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable no-console */

/**
 * @fileoverview Box skills-kit providing essential tools
 * for developing a Box skill, i.e. the fileReadClient and skill-invocation API.
 * It allows developers to use information coming in a persist information to
 * Box metadata resources, and subsequently display them as metadata card
 * in file preview view.
 * SkillsKit provides:
 * 1) fileReadClient (@see box-node-sdk documentation)
 * 2) skillInvocationsClient, with tools -
 *    2.1.) Functions for creating different metadata cards, with correctly formatted templates:
 *        2.1.1.) TopicCardTemplate
 *        2.1.2.) TranscriptCardTemplate
 *        2.1.3.) TimelineCardTemplate
 *   2.2.) Functions for saving different types of information cards to file metadata:
 *        2.2.1.) savePending
 *        2.2.2.) saveError
 *        2.2.3.) saveMetadata
 *   2.3.) Helpful Utility functions for handling files:
 *        2.3.1.) getFileExtension
 *        2.3.2.) validateFileType
 * This file also exports utility Enums for setting status, usage or errors values to metadata cards:
 * 1.) SkillsStatusEnum
 * 2.) SkillsUsageUnitEnum
 * 3.) SkillsErrorEnum
 */

/* External modules */
const BoxSDK = require('box-node-sdk');
const urlPath = require('box-node-sdk/lib/util/url-path');
const Enum = require('enum');
const path = require('path');
const trimStart = require('lodash/trimStart');

/* Constant values for writing cards to metadata service */
const BASE_PATH = '/skill_invocations'; // Base path for all files endpoints
const SKILLS_SERVICE_TYPE = 'service';
const SKILLS_METADATA_CARD_TYPE = 'skill_card';
const SKILLS_METADATA_INVOCATION_TYPE = 'skill_invocation';
const CARD_TYPE_TRANSCRIPT = 'transcript';
const CARD_TITLE_TRANSCRIPT = 'Transcript';
const CARD_TYPE_TOPIC = 'keyword';
const CARD_TITLE_TOPIC = 'Topics';
const CARD_TYPE_TIMELINE = 'timeline';
const CARD_TITLE_TIMELINE = 'Faces';
const CARD_TYPE_STATUS = 'status';
const CARD_TITLE_STATUS = 'Status';
const CARD_TITLE_ERROR = 'Error';

/* Utility Enums: To be used in developing skills anytime a skill is setting status, usage or errors */
const SkillsStatusEnum = new Enum({
    INVOKED: 'invoked',
    PROCESSING: 'processing',
    TRANSIENT_FAILURE: 'transient_failure',
    PERMANENT_FAILURE: 'permanent_failure',
    SUCCESS: 'success'
});

const SkillsErrorEnum = new Enum({
    FILE_PROCESSING_ERROR: 'skills_file_processing_error',
    INVALID_FILE_SIZE: 'skills_invalid_file_size_error',
    INVALID_FILE_FORMAT: 'skills_invalid_file_format_error',
    INVALID_EVENT: 'skills_invalid_event_error',
    NO_INFO_FOUND: 'skills_no_info_found_error',
    INVOCATIONS_ERROR: 'skills_invocations_error',
    EXTERNAL_AUTH_ERROR: 'skills_external_auth_error',
    BILLING_ERROR: 'skills_billing_error',
    UNKNOWN: 'skills_unknown_error',
    PENDING: 'skills_pending_status'
});

const SkillsUsageUnitEnum = new Enum({
    FILES: 'files',
    SECONDS: 'seconds',
    PAGES: 'pages',
    WORDS: 'words'
});

const DEFAULT_USAGE = { unit: SkillsUsageUnitEnum.FILES.value, value: 1 };

const errorMessagesList = {};
errorMessagesList[SkillsErrorEnum.FILE_PROCESSING_ERROR.value] =
    "We're sorry, something went wrong with processing the file.";
errorMessagesList[SkillsErrorEnum.INVALID_FILE_SIZE.value] =
    "We're sorry, no skills information was found. This file size is currently not supported.";
errorMessagesList[SkillsErrorEnum.INVALID_FILE_FORMAT.value] =
    "We're sorry, no skills information was found. Invalid information received.";
errorMessagesList[SkillsErrorEnum.INVALID_EVENT.value] =
    "We're sorry, no skills information was found. Invalid information received.";
errorMessagesList[SkillsErrorEnum.NO_INFO_FOUND.value] = "We're sorry, no skills information was found.";
errorMessagesList[SkillsErrorEnum.INVOCATIONS_ERROR.value] =
    'Something went wrong with running this skill or fetching its data.';
errorMessagesList[SkillsErrorEnum.EXTERNAL_AUTH_ERROR.value] =
    'Something went wrong with running this skill or fetching its data.';
errorMessagesList[SkillsErrorEnum.BILLING_ERROR.value] =
    'Something went wrong with running this skill or fetching its data.';
errorMessagesList[SkillsErrorEnum.UNKNOWN.value] = 'Something went wrong with running this skill or fetching its data.';
errorMessagesList[SkillsErrorEnum.PENDING.value] = "We're working on processing your file.";

const sdk = new BoxSDK({
    clientID: 'BoxSkillsClientId',
    clientSecret: 'BoxSkillsClientSecret'
});

/**
 * @constructor for SkillInvocations:
 * A simple manager for interacting with all 'Skill Invocations' endpoints and actions.
 *
 * @param {BoxClient} client       an instance of Box API Client
 * @param {string}    boxRequestId top level Id of Box request.body object
 * @param {string}    skillId      skill Id recieved in Box request.body object
 * @param {string}    skillName    arbitrary name given to the skill
 * @param {string}    fileId       file Id recieved in Box request.body object
 * @param {string}    writeToken   write access token recieved in Box request.body object
 *
 */
function SkillInvocations(client, boxRequestId, skillId, skillName, fileId, writeToken) {
    this.client = client; // Attach the client, for making API calls
    this.boxRequestId = boxRequestId;
    this.skillId = skillId;
    this.skillName = skillName;
    this.fileId = fileId;
    this.writeToken = writeToken;
}

/**
 * @constructor for SkillsKit:
 * Creates the two utility clients for developing a skill, for read files from box, and for saving skill results to box
 *
 * @param {string}    boxRequestId top level Id of Box request.body object
 * @param {string}    skillId      skill Id recieved in Box request.body object
 * @param {string}    skillName    arbitrary name given to the skill
 * @param {string}    fileId       file Id recieved in Box request.body object
 * @param {string}    writeToken   write access token recieved in Box request.body object
 * @return {Object}   an object containting clients to read file data from box, and to call skill invocation apis to save to metadata cards
 *
 */
function SkillsKit(boxRequestId, skillId, skillName, fileId, readToken, writeToken) {
    const fileReadClient = sdk.getBasicClient(readToken);
    const writeClient = sdk.getBasicClient(writeToken);
    const skillInvocations = new SkillInvocations(writeClient, boxRequestId, skillId, skillName, fileId, writeToken);
    return { fileReadClient, skillInvocations };
}
/**
 * Private function to return a complete metadata card
 *
 * @param {string} type         type of metadata card (status, transcript, etc.)
 * @param {string} title        title of metadata card (Status, Transcript, etc.)
 * @param {string} skillName    arbitrary name given to the skill
 * @param {string} boxRequestId box request Id
 * @param {Object} status       (optional) status object with code and message
 * @param {Object} entries      (optional) list of cards being saved
 * @param {number} fileDuration (optional) total duration of file in seconds
 * @return {Object} metadata card template
 */
const MetadataCardTemplate = (type, title, skillName, boxRequestId, status, entries, fileDuration) => {
    status = status || {};
    const titleCode = `skills_${title.toLowerCase()}`.replace(' ', '_');
    const template = {
        created_at: new Date().toISOString(),
        type: SKILLS_METADATA_CARD_TYPE, // skill_card
        skill: {
            type: SKILLS_SERVICE_TYPE, // service
            id: skillName
        },
        skill_card_type: type,
        skill_card_title: {
            code: titleCode,
            message: title
        },
        invocation: {
            type: SKILLS_METADATA_INVOCATION_TYPE, // skill_invocation
            id: boxRequestId
        },
        status
    };
    if (entries) {
        template.entries = entries;
    }
    if (fileDuration) {
        template.duration = parseFloat(fileDuration);
    }
    return template;
};

/**
 * Private function to validate if card template data to have expected fields
 */
const processCardData = (cardData, duration) => {
    if (!cardData.text) throw new TypeError(`Missing required 'text' field in ${JSON.stringify(cardData)}`);
    cardData.type = typeof cardData.image_url === 'string' ? 'image' : 'text';
    if (duration && !(Array.isArray(cardData.appears) && cardData.appears.length > 0)) {
        console.warn(
            `Missing optional 'appears' field in ${JSON.stringify(cardData)} which is list of 'start' and 'end' fields`
        );
    }
};

/**
 * Returns a valid topic card object
 *
 * @param  {Array<Object>} topicsList     list of topics { 'text' : topic_text_string }
                                          with optional 'appears':[{'start': start_seconds_number, 'end': end_seconds_number}] field in each topic.
 * @param  {number}        cardTitle      (optional) title of the card to show if not 'Topics'
 * @param  {number}        fileDuration   (optional) total duration in seconds of the file if start and end values are passed in 'appears'
 * @return {Object}        object with the correct metadata card template for a topic card.
 */

SkillInvocations.prototype.TopicCardTemplate = function(topicsList, fileDuration, cardTitle) {
    topicsList.forEach(topic => processCardData(topic, fileDuration));
    return MetadataCardTemplate(
        CARD_TYPE_TOPIC,
        cardTitle || CARD_TITLE_TOPIC,
        this.skillName,
        this.boxRequestId,
        {}, // Empty status card
        topicsList,
        fileDuration
    );
};

/**
 * Returns a valid transcript card object
 *
 * @param  {Array<Object>} transcriptData   list of transcripts { 'text' : transcript_text_string }
                                            with optional 'appears':[{'start': start_seconds_number, 'end': end_seconds_number}] field in each transcript.
 * @param  {number}        fileDuration     (optional) total duration of the file in seconds if start and end values are passed in 'appears'
 * @param  {number}        cardTitle        (optional) title of the card to show if not 'Transcripts'
 * @return {Object}        object with the correct metadata card template for a transcript card.
 */
SkillInvocations.prototype.TranscriptCardTemplate = function(transcriptsList, fileDuration, cardTitle) {
    transcriptsList.forEach(transcript => processCardData(transcript, fileDuration));
    return MetadataCardTemplate(
        CARD_TYPE_TRANSCRIPT,
        cardTitle || CARD_TITLE_TRANSCRIPT,
        this.skillName,
        this.boxRequestId,
        {}, // Empty status card
        transcriptsList,
        fileDuration
    );
};

/**
 * Returns a valid timelines card object
 *
 * @param  {Array<Object>} transcriptData   list of timelines { 'text' : timelines_text_string }
 *                                          or { 'text' : timeline_text_string, 'image_url' : thumbnail_image_uri_string }
 *                                          with optional 'appears':[{'start': start_seconds_number, 'end': end_seconds_number}] field in each transcript.
 * @param  {number}        cardTitle        (optional) title of the card to show if not 'Transcripts'
 * @param  {number}        fileDuration     (optional) total duration of the file in seconds if start and end values are passed in 'appears'
 * @return {Object}        object with the correct metadata card template for a transcript card.
 */

SkillInvocations.prototype.TimelineCardTemplate = function(timelinesList, fileDuration, cardTitle) {
    timelinesList.forEach(timeline => processCardData(timeline, fileDuration));
    return MetadataCardTemplate(
        CARD_TYPE_TIMELINE,
        cardTitle || CARD_TITLE_TIMELINE,
        this.skillName,
        this.boxRequestId,
        {}, // Empty status card
        timelinesList,
        fileDuration
    );
};

/**
 * Saves the status that a file is processing or skill has been invoked on it
 *
 * @param {Function} callback    (optional) function that will be called after the status card is saved
 * @return {Promise} A promise resolving to the updated metadata
 */
SkillInvocations.prototype.savePending = function(callback) {
    const status = { code: SkillsErrorEnum.PENDING.value, message: errorMessagesList[SkillsErrorEnum.PENDING.value] };
    const statusCard = MetadataCardTemplate(
        CARD_TYPE_STATUS,
        CARD_TITLE_STATUS,
        this.skillName,
        this.boxRequestId,
        status
    );

    /* Save card to skill-invocation service */
    return this.saveMetadata([statusCard], SkillsStatusEnum.PROCESSING.value, null, callback);
};

/**
 * Saves an error response into a metadata card for a file.
 * Note: Non-standard error codes (non-SkillsErrorEnum) will not reflect on Box Metadata UI, but will be saved to card in metadata service.
 * Custom error messages will also not reflect on Box Metadata UI, but will be saved to card in metadata service.
 *
 * @param  {string}          failureType   'transient_failure' or 'permanent_failure' (@see SkillsStatusEnum)
 * @param  {string}          code          (optional) error code specifying the type of error that occured (@see SkillsErrorEnum)
 * @param  {string}          message       (optional) description of the error
 * @param  {Function}        callback      (optional) function that will be called after the error card is saved
 * @return {Promise}         A promise resolving to the updated metadata
 */
SkillInvocations.prototype.saveError = function(failureType, code, message, callback) {
    /* Validate function arguments - failureType, code and message */
    if (
        failureType !== SkillsStatusEnum.TRANSIENT_FAILURE.value &&
        failureType !== SkillsStatusEnum.PERMANENT_FAILURE.value
    ) {
        throw new Error(`Invalid function parameter: ${failureType} should be \
          transient_failure or permanent_failure`);
    }
    code = code || SkillsErrorEnum.UNKNOWN.value; // default to unknown if error code not sent.
    message = message || errorMessagesList[code] || errorMessagesList[SkillsErrorEnum.UNKNOWN.value];

    /* Create status card of type error */
    const error = { code, message };
    const errorCard = MetadataCardTemplate(
        CARD_TYPE_STATUS,
        CARD_TITLE_ERROR,
        this.skillName,
        this.boxRequestId,
        error
    );

    /* Save card to skill-invocation service */
    return this.saveMetadata([errorCard], failureType, null, callback);
};

/**
 * Private function, for underlying call to saving data to skills invocation api
 * Will add metadata cards to the file and log other values for analysis purposes
 *
 * API Endpoint: '/skill_invocations/:skillID'
 * Method: PUT
 *
 * @param {BoxSDK} client       Box SDK client to call skill invocations apiId
 * @param {string} skillId      id of the skill for the '/skill_invocations/:skillID' call
 * @param {Object} body         data to put
 * @param {Function} callback   (optional) called with updated metadata if successful
 * @return {Promise<Object>}    promise resolving to the updated metadata
 */
const putData = (client, skillId, body, callback) => {
    const apiPath = urlPath(BASE_PATH, skillId);
    const params = {
        body,
        headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
        }
    };
    return client.wrapWithDefaultHandler(client.put)(apiPath, params, callback);
};

/**
 * Validates if usage object is of allowed format:
 * { unit: <SkillsUsageUnitEnum>, value: <Integer> }
 */
const validateUsage = usage =>
    usage &&
    usage.unit &&
    usage.value &&
    (usage.unit === SkillsUsageUnitEnum.FILES.value ||
        usage.unit === SkillsUsageUnitEnum.SECONDS.value ||
        usage.unit === SkillsUsageUnitEnum.PAGES.value ||
        usage.unit === SkillsUsageUnitEnum.WORDS.value) &&
    Number.isInteger(usage.value);

/**
 * Saves metadata for a file.
 *
 * @param {Array<Object>} metadata       any valid metadata template: (@see TopicCardTemplate), (@see TranscriptCardTemplate) or (@see TimelineCardTemplate)
 * @param {string} status                (optional) intermittent or final status of the skill (@see SkillsStatusEnum)
 * @param {Object} usage                 (optional) final skill usage value, necessary parameter for success status. (@see SkillsUsageUnitEnum)
 * @param {Function} callback            (optional) called with updated metadata if successful
 * @return {Promise<Object>} promise resolving to the updated metadata
 */
SkillInvocations.prototype.saveMetadata = function(metadata, status, usage, callback) {
    status = status || SkillsStatusEnum.SUCCESS.value;
    if (status === SkillsStatusEnum.SUCCESS.value) {
        usage = usage || DEFAULT_USAGE;
        if (!validateUsage(usage)) {
            throw new TypeError(
                `Usage object ${JSON.stringify(
                    usage
                )} passed is not in expected format of { unit: <SkillsUsageUnitEnum>, value: <Integer> }`
            );
        }
    }

    const body = {
        status,
        file: {
            type: 'file',
            id: this.fileId
        },
        metadata: {
            cards: metadata
        },
        usage
    };
    return putData(this.client, this.skillId, body, callback);
};

/**
 * Returns the file extension of the file.
 *
 * @param {string} filename     filename with or without fullpath
 * @param {boolean} withoutDot  if returned ext type should have '.' infront of it, (eg: '.ext' vs 'ext')
 */
SkillInvocations.prototype.getFileExtension = function(filename, withoutDot) {
    const ext = path.extname(filename);
    if (withoutDot) {
        return trimStart(ext, '.');
    }
    return ext;
};
/**
 * Checks that the file type is valid for a acceptable set of types.
 *
 *  @param {string} filename            filename with or without fullpath
 * @param {Object} validFileExtensions  list of valid file extensions
 */
SkillInvocations.prototype.validateFileType = function(filename, validFileExtensions) {
    const fileExtension = this.getFileExtension(filename).toLowerCase();

    if (!validFileExtensions.includes(fileExtension)) {
        console.error(`Invalid file type: ${fileExtension}. Expected to be ${JSON.stringify(validFileExtensions)}`);
        throw new Error(SkillsErrorEnum.INVALID_FILE_FORMAT.value);
    }
    return true;
};

/* Exporting useful functions and enums from skills-kit plugin */
module.exports = {
    SkillsKit,
    SkillsStatusEnum,
    SkillsUsageUnitEnum,
    SkillsErrorEnum
};
