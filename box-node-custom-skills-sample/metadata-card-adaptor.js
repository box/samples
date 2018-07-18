/**
 * @fileoverview ImageAdaptor class implementation.
 * MetadataCardAdaptor is sample result processing code to turn skills result to the standardized metadata v2 cards.
 */

class MetadataCardAdaptor {
    static getBase64URIFromURL = async thumbnailUrl => {
        return new Promise(resolve =>
            request.get(thumbnailUrl, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const base64URI = `data:${response.headers['content-type']};base64,${Buffer.from(body).toString(
                        'base64'
                    )}`;
                    // e.g. of a Base 64 encoded URI:
                    // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAcFBQYFBAcGBQYIBwcIChELCgkJChUPEAwRGBU.....
                    resolve(base64URI);
                } else {
                    // Do nothing, set the url again
                    Logger.logError(`Error downloading thumbnail: ${thumbnailUrl}`);
                    resolve(thumbnailUrl);
                }
            })
        );
    };

    static sampleResultProcessingCode = async (skillInvocationsClient, fileId) => {
        // ref test/skills-kit.test  file to see more samples of using the skills-kit api for formatting such metadata cards.
        const topicData = [{ text: `Hello World from file ${fileId}` }];
        const sampleKeywordCard = skillInvocationsClient.TopicCardTemplate(keywordData);

        const transcriptData = [{ text: `Hello World from file ${fileId}`, appears: [{ start: 0, end: 1 }] }, 1];
        const sampleTranscriptCard = skillInvocationsClient.TranscriptCardTemplate(transcriptData);

        // timeline data can contain an image_url property with a string value of a thumbnail image.
        // e.g. of a Base 64 encoded URI for an image url:
        // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAcFBQYFBAcGBQYIBwcIChELCgkJChUPEAwRGBU.....
        sampleThumbnailUrl = 'https://seeklogo.com/images/B/box-logo-646A3D8C91-seeklogo.com.png';
        const timeLineData = [
            {
                text: `Hello World from file ${fileId}`,
                image_url: await getBase64URIFromURL(sampleThumbnailUrl), //utility function to cover URL location
                appears: [{ start: 0, end: 1 }]
            },
            1 //total file duration
        ];
        const sampleTimeLineCard = skillInvocationsClient.TimeLineCardTemplate(timeLineData);
        return [sampleTimeLineCard, sampleTopicCard, sampleTranscriptCard];
    };
}

module.exports = MetadataCardAdaptor;
