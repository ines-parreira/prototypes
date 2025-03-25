import MockAdapter from 'axios-mock-adapter'

import authClient from 'models/api/resources'

import { apiClient } from '../message-processing'
import { transformToneOfVoice } from '../transform-tone-of-voice'

describe('transform-tone-of-voice', () => {
    let authServer: MockAdapter
    let apiServer: MockAdapter

    beforeAll(() => {
        authServer = new MockAdapter(authClient)
        authServer.onPost(`/gorgias-apps/auth`).reply(200, {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A',
        })

        apiServer = new MockAdapter(apiClient)
    })

    afterAll(() => {
        authServer.reset()
        apiServer.reset()
    })

    describe('transformToneOfVoice', () => {
        it('should call transformToneOfVoice with the correct body', async () => {
            apiServer.onPost('/api/tov/transform-conversations').reply(200)

            await expect(
                transformToneOfVoice('test-gorgias', 'Be smart', []),
            ).resolves.toEqual(expect.objectContaining({ status: 200 }))
        })
    })
})
