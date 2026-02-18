import MockAdapter from 'axios-mock-adapter'

import authClient from 'models/api/resources'

import { apiClient as aiAgentApiClient } from '../message-processing'
import { createTestSession, submitTestSessionMessage } from '../playground'

describe('aiAgent/resources/test/playground', () => {
    let authServer: MockAdapter
    let aiAgentServer: MockAdapter

    beforeAll(() => {
        authServer = new MockAdapter(authClient)
        authServer.onPost(`/gorgias-apps/auth`).reply(200, {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A', // gitleaks:allow
        })

        aiAgentServer = new MockAdapter(aiAgentApiClient)
    })

    beforeEach(() => {
        aiAgentServer.resetHistory()
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

    describe('submitTestSessionMessage', () => {
        it('should make a POST request to /api/test-mode-session/message with payload', async () => {
            const payload = {
                sessionId: 'session-123',
                userMessage: {
                    type: 'message' as const,
                    role: 'user' as const,
                    content: [{ type: 'text' as const, text: 'Hello' }],
                },
                isDirectModelCall: false,
            }
            const expectedResponse = { success: true }

            aiAgentServer
                .onPost('/api/test-mode-session/message')
                .reply(200, expectedResponse)

            const response = await submitTestSessionMessage(undefined, payload)

            expect(aiAgentServer.history.post.length).toBe(1)
            expect(aiAgentServer.history.post[0].url).toBe(
                '/api/test-mode-session/message',
            )
            expect(JSON.parse(aiAgentServer.history.post[0].data)).toEqual(
                payload,
            )
            expect(response).toEqual(expectedResponse)
        })

        it('should make a POST request with empty payload when no arguments are provided', async () => {
            const expectedResponse = { success: true }

            aiAgentServer
                .onPost('/api/test-mode-session/message')
                .reply(200, expectedResponse)

            const response = await submitTestSessionMessage()

            expect(aiAgentServer.history.post.length).toBe(1)
            expect(aiAgentServer.history.post[0].url).toBe(
                '/api/test-mode-session/message',
            )
            expect(response).toEqual(expectedResponse)
        })
    })
})
