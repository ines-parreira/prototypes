import MockAdapter from 'axios-mock-adapter'

import authClient from 'models/api/resources'

import { apiClient as aiAgentApiClient } from '../message-processing'
import { createTestSession } from '../playground'

describe('aiAgent/resources/test/playground', () => {
    let authServer: MockAdapter
    let aiAgentServer: MockAdapter

    beforeAll(() => {
        authServer = new MockAdapter(authClient)
        authServer.onPost(`/gorgias-apps/auth`).reply(200, {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A',
        })

        aiAgentServer = new MockAdapter(aiAgentApiClient)
    })

    afterAll(() => {
        authServer.reset()
        aiAgentServer.reset()
    })

    describe('createTestSession', () => {
        it('should make a POST request to /api/test-mode-session', async () => {
            const expectedResponse = {
                testModeSession: {
                    id: 'abc123',
                    accountId: 1,
                    creatorUserId: 1,
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            }

            aiAgentServer
                .onPost('/api/test-mode-session')
                .reply(201, expectedResponse)

            const response = await createTestSession()

            expect(aiAgentServer.history.post.length).toBe(1)
            expect(aiAgentServer.history.post[0].url).toBe(
                '/api/test-mode-session',
            )
            expect(response).toEqual(expectedResponse)
        })
    })
})
