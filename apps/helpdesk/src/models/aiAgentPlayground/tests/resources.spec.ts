import client from '@repo/api-resources'
import MockAdapter from 'axios-mock-adapter'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockSearchTicketsHandler,
    mockSearchTicketsResponse,
} from '@gorgias/helpdesk-mocks'

import { SearchType } from 'models/search/types'

import { getAiAgentCustomer, searchCustomer, searchTickets } from '../resources'

describe('aiAgentPlayground resources', () => {
    let mockClient: MockAdapter
    const server = setupServer()

    beforeAll(() => {
        mockClient = new MockAdapter(client)
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterAll(() => {
        mockClient.reset()
        server.close()
    })

    afterEach(() => {
        mockClient.resetHistory()
        server.resetHandlers()
        jest.clearAllMocks()
    })

    describe('searchCustomer', () => {
        it('should make a POST request to /api/search with correct parameters', async () => {
            const email = 'test@example.com'
            const expectedResponse = { results: [{ id: 1, email }] }

            mockClient.onPost('/api/search').reply(200, expectedResponse)

            const response = await searchCustomer({ email })

            expect(mockClient.history.post.length).toBe(1)
            expect(mockClient.history.post[0].url).toBe('/api/search')
            expect(JSON.parse(mockClient.history.post[0].data)).toEqual({
                type: SearchType.UserChannelEmail,
                query: email,
                size: 10,
            })
            expect(response.data).toEqual(expectedResponse)
        })
    })

    describe('getAiAgentCustomer', () => {
        it('should make a POST request to /api/automate/ai-agent/playground with correct body', async () => {
            const requestBody = { email: 'test@example.com', id: 123 }
            const expectedResponse = {
                customer: { id: 123, email: 'test@example.com' },
            }

            mockClient
                .onPost('/api/automate/ai-agent/playground')
                .reply(200, expectedResponse)

            const response = await getAiAgentCustomer(requestBody as any)

            expect(mockClient.history.post.length).toBe(1)
            expect(mockClient.history.post[0].url).toBe(
                '/api/automate/ai-agent/playground',
            )
            expect(JSON.parse(mockClient.history.post[0].data)).toEqual(
                requestBody,
            )
            expect(response.data).toEqual(expectedResponse)
        })
    })

    describe('searchTickets', () => {
        it('should call helpdeskSearchTickets with email channel filter', async () => {
            const searchTicketsMock = mockSearchTicketsHandler(async () =>
                HttpResponse.json(
                    mockSearchTicketsResponse({
                        data: [],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                    }),
                ),
            )
            const waitForSearchTicketsRequest =
                searchTicketsMock.waitForRequest(server)
            server.use(searchTicketsMock.handler)
            const query = 'test search query'

            await searchTickets(query)

            await waitForSearchTicketsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual({
                    search: query,
                    filters: '',
                })
                expect(searchParams.get('limit')).toBe('10')
            })
        })
    })
})
