import MockAdapter from 'axios-mock-adapter'

import authClient from 'models/api/resources'

import { apiClient } from '../message-processing'
import { generateToneOfVoice } from '../tone-of-voice'

describe('tone-of-voice', () => {
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

    describe('generateToneOfVoice', () => {
        it('should call generateToneOfVoice with the correct body', async () => {
            apiServer.onPost('/api/tov/generate').reply(200)

            await expect(
                generateToneOfVoice('test-gorgias', 'test-store'),
            ).resolves.toEqual(expect.objectContaining({ status: 200 }))
        })
    })
})
