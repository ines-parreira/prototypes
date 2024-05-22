import MockAdapter from 'axios-mock-adapter'

import {
    apiClient,
    getAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/resources'

const mockedServer = new MockAdapter(apiClient)

describe('AI Agent Feedback resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should resolve with the ticket messages feedback on success', async () => {
        const ticketId = 123
        const expectedFeedback = {
            shopName: 'sf-bicycle',
            shopType: 'shopify',
            messages: [
                {messageId: 1, feedback: 1},
                {messageId: 2, feedback: -1},
            ],
        }

        mockedServer.onGet(`/tickets/${ticketId}`).reply(200, expectedFeedback)

        const feedback = await getAIAgentTicketMessagesFeedback(ticketId)
        expect(feedback.data).toEqual(expectedFeedback)
    })

    it('should reject an error on fail', () => {
        const ticketId = 123
        mockedServer.onGet(`tickets/${ticketId}`).reply(503, {message: 'error'})

        return expect(
            getAIAgentTicketMessagesFeedback(ticketId)
        ).rejects.toEqual(new Error('Request failed with status code 503'))
    })
})
