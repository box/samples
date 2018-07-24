const { SkillsKit, SkillsStatusEnum, SkillsErrorEnum } = require('./../skills-kit');

const mockDateValue = new Date().toISOString();
const fileId = 'mockfileId';
const boxRequestId = 'mockBoxId';
const skillId = 'mockSkillId';
const skillName = 'mockSkillName';

describe('cardTemplates', () => {
    const { skillInvocations } = new SkillsKit(boxRequestId, skillId, skillName, fileId, 'readToken', 'writeToken');

    test('TopicCardTemplate', () => {
        const card = skillInvocations.TopicCardTemplate(
            [{ text: 'text1', appears: [{ start: 0.0, end: 1.0 }] }],
            2.2,
            'my topics'
        );
        card.created_at = mockDateValue;
        expect(card).toEqual({
            created_at: mockDateValue,
            duration: 2.2,
            entries: [{ appears: [{ end: 1.0, start: 0.0 }], text: 'text1', type: 'text' }],
            invocation: { id: 'mockBoxId', type: 'skill_invocation' },
            skill: { id: 'mockSkillName', type: 'service' },
            skill_card_title: { code: 'skills_my_topics', message: 'my topics' }, // custom title case, default title.message would be 'Topics'
            skill_card_type: 'keyword',
            status: {},
            type: 'skill_card'
        });
    });

    test('TranscriptCardTemplate', () => {
        const card = skillInvocations.TranscriptCardTemplate(
            [{ text: 'text1', appears: [{ start: 0.0, end: 1.0 }] }],
            1.8
        );
        card.created_at = mockDateValue;
        expect(card).toEqual({
            created_at: mockDateValue,
            duration: 1.8,
            entries: [{ appears: [{ end: 1.0, start: 0.0 }], text: 'text1', type: 'text' }],
            invocation: { id: 'mockBoxId', type: 'skill_invocation' },
            skill: { id: 'mockSkillName', type: 'service' },
            skill_card_title: { code: 'skills_transcript', message: 'Transcript' },
            skill_card_type: 'transcript',
            status: {},
            type: 'skill_card'
        });
    });

    test('TimelineCardTemplate', () => {
        const card = skillInvocations.TimelineCardTemplate(
            [{ text: 'text1', appears: [{ start: 0.0, end: 1.0 }] }],
            1.0
        );
        card.created_at = mockDateValue;
        expect(card).toEqual({
            created_at: mockDateValue,
            duration: 1,
            entries: [{ appears: [{ end: 1.0, start: 0.0 }], text: 'text1', type: 'text' }],
            invocation: { id: 'mockBoxId', type: 'skill_invocation' },
            skill: { id: 'mockSkillName', type: 'service' },
            skill_card_title: { code: 'skills_faces', message: 'Faces' },
            skill_card_type: 'timeline',
            status: {},
            type: 'skill_card'
        });
    });

    test('CardTemplatesInvalidInputDataFormat', () => {
        try {
            skillInvocations.TimelineCardTemplate([{ start: 0.0, end: 1.0 }, 1.0]);
        } catch (err) {
            expect(typeof err === typeof TypeError);
        }
    });
});

describe('savePending', () => {
    const { skillInvocations } = new SkillsKit(boxRequestId, skillId, skillName, fileId, 'readToken', 'writeToken');

    test('savePendingStatusProcessing', () => {
        skillInvocations.saveMetadata = jest.fn(([statusCard]) => statusCard); // don't wrap into metadata, return single status card
        const response = skillInvocations.savePending();
        response.created_at = mockDateValue;
        expect(response).toEqual({
            created_at: mockDateValue,
            invocation: { id: 'mockBoxId', type: 'skill_invocation' },
            skill: { id: 'mockSkillName', type: 'service' },
            skill_card_title: { code: 'skills_status', message: 'Status' },
            skill_card_type: 'status',
            status: { code: 'skills_pending_status', message: "We're working on processing your file." },
            type: 'skill_card'
        });
    });
});

describe('saveError', () => {
    const { skillInvocations } = new SkillsKit(boxRequestId, skillId, skillName, fileId, 'readToken', 'writeToken');
    skillInvocations.saveMetadata = jest.fn(([errorCard]) => errorCard); // don't wrap into metadata, return single error card

    test('saveErrorWithDefaultCodeAndMessage', () => {
        const response = skillInvocations.saveError(SkillsStatusEnum.TRANSIENT_FAILURE.value);
        response.created_at = mockDateValue;
        expect(response).toEqual({
            // single error card
            created_at: mockDateValue,
            type: 'skill_card',
            skill_card_type: 'status',
            skill: { type: 'service', id: 'mockSkillName' },
            invocation: { type: 'skill_invocation', id: 'mockBoxId' },
            status: {
                code: 'skills_unknown_error',
                message: 'Something went wrong with running this skill or fetching its data.'
            },
            skill_card_title: { code: 'skills_error', message: 'Error' }
        });
        expect(response.status.code).toEqual(SkillsErrorEnum.UNKNOWN.value);
        expect(response.status.message).toEqual('Something went wrong with running this skill or fetching its data.');
    });

    test('saveErrorWithCustomCodeAndMessage', () => {
        const response = skillInvocations.saveError(SkillsStatusEnum.PERMANENT_FAILURE.value, 'code1', 'message1');
        response.created_at = mockDateValue;
        expect(response).toEqual({
            created_at: mockDateValue,
            invocation: { id: 'mockBoxId', type: 'skill_invocation' },
            skill: { id: 'mockSkillName', type: 'service' },
            skill_card_title: { code: 'skills_error', message: 'Error' },
            skill_card_type: 'status',
            status: { code: 'code1', message: 'message1' },
            type: 'skill_card'
        });
        expect(response.status.code).toEqual('code1');
        expect(response.status.message).toEqual('message1');
    });
});

describe('saveMetadata', () => {
    const { skillInvocations } = new SkillsKit(boxRequestId, skillId, skillName, fileId, 'readToken', 'writeToken');

    test('saveMetadataWithDefaultStatusAndUsage', done => {
        skillInvocations.saveMetadata([], null, null, err => {
            expect(err.response.statusCode).toBe(401);
            expect(JSON.parse(err.response.request.body)).toEqual({
                status: 'success', // default status
                file: { type: 'file', id: 'mockfileId' },
                metadata: { cards: [] }, // cards of various types as shown being created in above tests could go here
                usage: { unit: 'files', value: 1 } // defualt usage
            });
            done();
        });
    });

    test('saveMetadataWithDefaultStatusAndNonDefaultUsage', done => {
        skillInvocations.saveMetadata([], null, { unit: 'seconds', value: 10 }, err => {
            expect(err.response.statusCode).toBe(401);
            expect(JSON.parse(err.response.request.body)).toEqual({
                status: 'success', // default status
                file: { type: 'file', id: 'mockfileId' },
                metadata: { cards: [] }, // cards of various types as shown being created in above tests could go here
                usage: { unit: 'seconds', value: 10 } // default usage
            });
            done();
        });
    });

    test('saveMetadataWithStringUsage', done => {
        try {
            skillInvocations.saveMetadata([], null, 'badUsage');
        } catch (err) {
            expect(typeof err === typeof TypeError);
            done();
        }
    }); // empty cards

    test('saveMetadataWithDecimalValueUsage', done => {
        try {
            skillInvocations.saveMetadata([], null, { unit: 'seconds', value: 1.7 });
        } catch (err) {
            expect(typeof err === typeof TypeError);
            done();
        } // non-integer value
    });

    test('saveMetadataWithInvalidUnitUsage', done => {
        try {
            skillInvocations.saveMetadata([], null, { unit: 'badUnit', value: 1 });
        } catch (err) {
            expect(typeof err === typeof TypeError);
            done();
        } // empty cards
    });

    test('saveMetadataWithMissingValueUsage', done => {
        try {
            skillInvocations.saveMetadata([], null, { unit: 'pages' });
        } catch (err) {
            expect(typeof err === typeof TypeError);
            done();
        } // no value
    });
});

describe('fileUtils', () => {
    const { skillInvocations } = new SkillsKit(boxRequestId, skillId, skillName, fileId, 'readToken', 'writeToken');

    test('getFileExtensionWithDot', () => {
        const ext = skillInvocations.getFileExtension('file.ext');
        expect(ext).toEqual('.ext');
    });

    test('getFileExtensionWithoutDot', () => {
        const ext = skillInvocations.getFileExtension('file.ext', true);
        expect(ext).toEqual('ext');
    });

    test('getFileExtensionFromFullFilePath', () => {
        const ext = skillInvocations.getFileExtension('/path/to/file.ext', false);
        expect(ext).toEqual('.ext');
    });

    test('validateFileTypeCapital', () => {
        const valid = skillInvocations.validateFileType('file.EXT', ['.ext']);
        expect(valid).toEqual(true);
    });

    test('validateFileTypeInvalidFileType', () => {
        try {
            skillInvocations.validateFileType('file.ext', []);
        } catch (err) {
            expect(err.message).toEqual(SkillsErrorEnum.INVALID_FILE_FORMAT.value);
        }
    });
});
