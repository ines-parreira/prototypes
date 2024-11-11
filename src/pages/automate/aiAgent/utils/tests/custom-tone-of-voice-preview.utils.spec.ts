import {
    AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET,
    PLAYGROUND_CUSTOMER_MOCK,
} from '../../constants'
import {createCustomToneOfVoicePreviewBody} from '../custom-tone-of-voice-preview.utils'

const mockInput = {
    gorgiasDomain: 'example.gorgias.com',
    accountId: 123,
    storeName: 'Example Store',
    customToneOfVoice: 'Friendly',
}

const expectedOutput = {
    domain: 'example.gorgias.com',
    from_agent: false,
    customer_email: PLAYGROUND_CUSTOMER_MOCK.email,
    customer: PLAYGROUND_CUSTOMER_MOCK,
    body_text: AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET.bodyText,
    subject: AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET.subject,
    http_integration_id: 1,
    account_id: 123,
    messages: [
        {
            bodyText: AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET.bodyText,
            fromAgent: false,
            meta: {
                name: PLAYGROUND_CUSTOMER_MOCK.name,
            },
            createdDatetime: expect.any(String),
        },
    ],
    created_datetime: expect.any(String),
    channel: 'email',
    _playground_options: {
        shopName: 'Example Store',
        customToneOfVoice: 'Friendly',
    },
}

describe('createCustomToneOfVoicePreviewBody', () => {
    it('should create the correct preview body', () => {
        const result = createCustomToneOfVoicePreviewBody(mockInput)
        expect(result).toEqual(expectedOutput)
    })
})
