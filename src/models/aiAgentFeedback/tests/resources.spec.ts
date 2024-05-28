import MockAdapter from 'axios-mock-adapter'

import {
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
    apiClient,
} from 'models/aiAgentFeedback/resources'
import {SubmitMessageFeedback} from '../types'

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
                {messageId: 1, feedback: 'thumbs_up'},
                {messageId: 2, feedback: 'thumbs_down'},
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

    it('should resolve with the feedback on success', async () => {
        const ticketId = 123
        const messageId = 456
        const feedbackToSubmit: SubmitMessageFeedback = {
            feedbackOnResource: [{resourceId: 1, feedback: 'thumbs_up'}],
            feedbackOnMessage: [
                {type: 'binary', feedback: 'thumbs_up'},
                {type: 'resource', resourceType: 'article', resourceId: 2},
            ],
        }

        mockedServer
            .onPost(`feedback/ticket/${ticketId}/message/${messageId}`)
            .reply(200, feedbackToSubmit)

        const feedback = await submitAIAgentTicketMessagesFeedback(
            ticketId,
            messageId,
            feedbackToSubmit
        )
        expect(feedback.data).toEqual(feedbackToSubmit)
    })
})
