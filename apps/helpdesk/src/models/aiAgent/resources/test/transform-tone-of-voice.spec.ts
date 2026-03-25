import MockAdapter from 'axios-mock-adapter'

import authClient from 'models/api/resources'
import { PRODUCT_RECOMMENDATION_MESSAGE_ID } from 'pages/aiAgent/Onboarding_V2/constants/previewConstants'

import { apiClient } from '../message-processing'
import { transformToneOfVoice } from '../transform-tone-of-voice'

const CONVERSATION = {
    id: 'test',
    messages: [
        {
            id: PRODUCT_RECOMMENDATION_MESSAGE_ID,
            message: 'Test message',
            from_agent: true,
        },
    ],
}

describe('transform-tone-of-voice', () => {
    let authServer: MockAdapter
    let apiServer: MockAdapter

    beforeAll(() => {
        authServer = new MockAdapter(authClient)
        authServer.onPost(`/gorgias-apps/auth`).reply(200, {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A', // gitleaks:allow
        })

        apiServer = new MockAdapter(apiClient)
    })

    afterAll(() => {
        authServer.reset()
        apiServer.reset()
    })

    describe('transformToneOfVoice', () => {
        it('should call transformToneOfVoice with the correct body', async () => {
            apiServer.onPost('/api/tov/transform-conversations').reply(200, {
                conversations: [CONVERSATION, CONVERSATION],
            })

            await expect(
                transformToneOfVoice('test-gorgias', 'Be smart', [
                    CONVERSATION,
                    CONVERSATION,
                ]),
            ).resolves.toEqual([CONVERSATION, CONVERSATION])
        })
    })
})
