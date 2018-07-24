/**
 * @fileoverview Main sample skill lambda handler.
 */

/**
 * Module dependencies
 */
const ErrorParser = require('error-parser');
const MetadataCardAdaptor = require('metadata-card-adaptor');
const { SkillsStatusEnum, SkillsErrorEnum } = require('skills-kit');

const CUSTOM_SKILL_NAME = 'box-custom-sample-skill-node';

/**
 * This is the main function that the Lambda will call when invoked.
 *
 * @param {Object} event - data from the event, including the payload of the webhook, that triggered this function call
 * @param {Object} context - additional context information from the request (unused in this example)
 * @param {Function} callback - the function to call back to once finished
 * @return {null} - lambda callback
 */
module.exports.handler = async (event: Object, context: Object, callback: Function): void => {
    // log the box skills event recieved from box event pump, to see what data is availabe to you regarding a file on which your skill is invoked.
    console.error(`Box Event received: ${JSON.stringify(event)}`);

    let skillInvocationsClient;
    try {
        // parse the incoming event to it's individual compoenents, and get fileReadClient and skillInvocations for use within your skills code
        const { body } = event;
        const { id: boxRequestId, skill, source, token } = JSON.parse(body);
        const { read: { access_token: boxFileReadToken }, write: { access_token: boxFileWriteToken } } = token;
        const { fileReadClient, skillInvocations } = new SkillsKit(
            boxRequestId,
            skill.id,
            CUSTOM_SKILL_NAME,
            source.id,
            boxFileReadToken,
            boxFileWriteToken
        );
        skillInvocationsClient = skillInvocations;

        // write back an intitial File Metadata card that event processing has started, to show on the file preview UI sidebar.
        await skillInvocationsClient.savePending();

        // <PLEASE WRITE YOUR OWN CODE HERE> to use the file infromation from the incoming skills request to download the file from box, in one of two ways-
        // 1) GET on `${process.env.BOX_API_ENDPOINT}/files/${source.id}/content?access_token=${boxFileReadToken}`
        // 2) const {error, stream} = await fileReadClient.files.getReadStream(this.fileId);

        // <PLEASE WRITE YOUR OWN CODE HERE> to write code to process the file, locally or through an external machine learning service provider, to extract useful information from your file

        // <PLEASE WRITE YOUR OWN CODE HERE> to use standard File Metadata Card templates create for skills, to show either faces(timeline), topics, or transcript cards, with your extracted data.
        const cards = await sampleResultProcessingCode(skillInvocationsClient, source.id);
        console.debug('cards created as: ', JSON.stringify(cards));

        // save the above result cards to Files Metadata cards, to show on the file preview UI sidebar.
        await skillInvocationsClient.saveMetadata(cards, SkillsStatusEnum.SUCCESS.value, null, error =>
            console.error(JSON.stringify(error))
        );
    } catch (error) {
        console.error(`Runtime exception caught: ${error.message}`);
        if (skillInvocationsClient) {
            // error parsing and writing standard error types to Files Metadata cards, to show on the file preview UI sidebar.
            // ref: SkillsStatusEnum.PERMANENT_FAILURE, SkillsStatusEnum.TEMPORARIY_FAILURE & SkillsErrorEnum
            const boxSkillsError = new ErrorParser(error.message).parseBoxSkillsInvocationError().getSkillsErrorCode();
            skillInvocationsClient.saveError(SkillsStatusEnum.PERMANENT_FAILURE.value, boxSkillsError);
        }
    } finally {
        // always respond to initial event pump POST request with 200
        // and anticipate the skill code to finish executing before lambda timeout of 30 seconds.
        callback(null, {
            statusCode: 200,
            body: 'Event request processed'
        });
    }
};
