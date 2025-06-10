import MockAdapter from 'axios-mock-adapter'

import { searchTickets as helpdeskSearchTickets } from '@gorgias/helpdesk-client'

import { TicketChannel } from 'business/types/ticket'
import client from 'models/api/resources'
import { SearchType } from 'models/search/types'

import {
    getAiAgentCustomer,
    searchCustomer,
    searchEmailTickets,
} from '../resources'

jest.mock('@gorgias/helpdesk-client', () => ({
    searchTickets: jest.fn(),
}))
const mockHelpdeskSearchTickets = jest.mocked(helpdeskSearchTickets)

describe('aiAgentPlayground resources', () => {
    let mockClient: MockAdapter

    beforeAll(() => {
        mockClient = new MockAdapter(client)
    })

    afterAll(() => {
        mockClient.reset()
    })

    afterEach(() => {
        mockClient.resetHistory()
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

    describe('searchEmailTickets', () => {
        it('should call helpdeskSearchTickets with email channel filter', async () => {
            const query = 'test search query'
            await searchEmailTickets(query)

            expect(mockHelpdeskSearchTickets).toHaveBeenCalledWith(
                {
                    search: query,
                    filters: `eq(ticket.channel, "${TicketChannel.Email}")`,
                },
                { limit: 10 },
            )
        })
    })
})
