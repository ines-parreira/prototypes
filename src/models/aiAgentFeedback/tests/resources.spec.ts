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
        const messageIds = [1, 2]
        const expectedFeedback = {
            shopName: 'sf-bicycle',
            shopType: 'shopify',
            messages: [{messageId: 1}, {messageId: 2}],
        }

        mockedServer
            .onGet(`/feedback/messages?ids=${messageIds.join(',')}`)
            .reply(200, expectedFeedback)

        const feedback = await getAIAgentTicketMessagesFeedback(messageIds)
        expect(feedback.data).toEqual(expectedFeedback)
    })

    it.skip('should reject an error on fail', () => {
        const messageIds = [1, 2]
        mockedServer
            .onGet(`/feedback/messages?ids=${messageIds.join(',')}`)
            .reply(503, {message: 'error'})

        return expect(
            getAIAgentTicketMessagesFeedback(messageIds)
        ).rejects.toEqual(new Error('Request failed with status code 503'))
    })

    it.skip('should resolve with the feedback on success', async () => {
        const messageId = 456
        const feedbackToSubmit: SubmitMessageFeedback = {
            feedbackOnResource: [
                {
                    resourceId: 1,
                    resourceType: 'soft_action',
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
            .onPost(`feedback/messages/${messageId}`)
            .reply(200, feedbackToSubmit)

        const feedback = await submitAIAgentTicketMessagesFeedback(
            messageId,
            feedbackToSubmit
        )
        expect(feedback.data).toEqual(feedbackToSubmit)
    })

    it.skip('should delete the feedback on success', async () => {
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
            .onDelete(`feedback/messages/${messageId}`)
            .reply(200, feedbackToDelete)

        const feedback = await deleteAIAgentTicketMessagesFeedback(
            messageId,
            feedbackToDelete
        )
        expect(feedback.data).toEqual(feedbackToDelete)
    })
})
