import MockAdapter from 'axios-mock-adapter'

import {apiClient} from 'models/aiAgent/resources/account-configuration'

import {
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
    deleteAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/resources'
import {SubmitMessageFeedback, DeleteMessageFeedback} from '../types'
import {ReportIssueOption} from '../constants'

const mockedServer = new MockAdapter(apiClient)

describe('AI Agent Feedback resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it.skip('should resolve with the ticket messages feedback on success', async () => {
        const ticketId = 123
        const expectedFeedback = {
            shopName: 'sf-bicycle',
            shopType: 'shopify',
            messages: [{messageId: 1}, {messageId: 2}],
        }

        mockedServer
            .onGet(`/feedback/ticket/${ticketId}`)
            .reply(200, expectedFeedback)

        const feedback = await getAIAgentTicketMessagesFeedback(ticketId)
        expect(feedback.data).toEqual(expectedFeedback)
    })

    it.skip('should reject an error on fail', () => {
        const ticketId = 123
        mockedServer
            .onGet(`/feedback/ticket/${ticketId}`)
            .reply(503, {message: 'error'})

        return expect(
            getAIAgentTicketMessagesFeedback(ticketId)
        ).rejects.toEqual(new Error('Request failed with status code 503'))
    })

    it.skip('should resolve with the feedback on success', async () => {
        const ticketId = 123
        const messageId = 456
        const feedbackToSubmit: SubmitMessageFeedback = {
            feedbackOnResource: [
                {
                    resourceId: 1,
                    resourceType: 'action',
                    type: 'binary',
                    feedback: 'thumbs_up',
                },
            ],
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

    it.skip('should delete the feedback on success', async () => {
        const ticketId = 123
        const messageId = 456
        const feedbackToDelete: DeleteMessageFeedback = {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    type: 'issue',
                    feedback: ReportIssueOption.IncorrectLanguageUsed,
                },
                {type: 'resource', resourceType: 'article', resourceId: 2},
            ],
        }

        mockedServer
            .onDelete(`feedback/ticket/${ticketId}/message/${messageId}`)
            .reply(200, feedbackToDelete)

        const feedback = await deleteAIAgentTicketMessagesFeedback(
            ticketId,
            messageId,
            feedbackToDelete
        )
        expect(feedback.data).toEqual(feedbackToDelete)
    })
})
