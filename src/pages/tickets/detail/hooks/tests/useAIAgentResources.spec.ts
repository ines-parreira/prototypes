import {renderHook} from '@testing-library/react-hooks'
import {MessageFeedback} from 'models/aiAgentFeedback/types'
import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {useAIAgentResources} from '../useAIAgentResources'

describe('useAIAgentResources', () => {
    it('returns empty arrays if no messageFeedback is provided', () => {
        const {result} = renderHook(() => useAIAgentResources(null))
        expect(result.current).toEqual({
            actions: [],
            guidance: [],
            knowledge: [],
        })
    })

    it('returns actions, guidance, and knowledge with feedback', () => {
        const messageFeedback: MessageFeedback = {
            shopName: 'fast-cars',
            shopType: 'shopify',
            messageId: 1137369657,
            summary:
                'AI Agent sent a response and left the ticket open pending further information from the customer.',
            orders: [{id: 3324, url: 'https://gorgias.com'}],
            allowsFeedback: true,
            feedbackOnMessage: [
                {
                    type: 'issue',
                    feedback: ReportIssueOption.IncorrectLanguageUsed,
                },
            ],
            actions: [
                {id: 1, name: 'Snooze'},
                {id: 2, name: 'Close'},
                {id: 3, name: 'Cancel'},
            ],
            guidance: [
                {id: 1, name: 'Cancelling an order'},
                {id: 2, name: 'Refund'},
                {id: 3, name: 'Shipping'},
            ],
            knowledge: [
                {
                    type: 'article',
                    id: 234,
                    name: 'Refund Policy',
                },
                {
                    type: 'external_snippet',
                    id: 235,
                    name: 'Shipping times',
                    url: 'https://artemis.gorgias.help/en-US#article-13609',
                },
                {type: 'macro', id: 236, name: 'Damaged items'},
            ],
            feedbackOnResource: [
                {
                    resourceId: 1,
                    resourceType: 'action',
                    type: 'binary',
                    feedback: 'thumbs_up',
                },
                {
                    resourceId: 2,
                    resourceType: 'action',
                    type: 'binary',
                    feedback: 'thumbs_down',
                },
                {
                    resourceId: 3,
                    resourceType: 'action',
                    type: 'binary',
                    feedback: null,
                },
                {
                    resourceId: 1,
                    resourceType: 'guidance',
                    type: 'binary',
                    feedback: 'thumbs_up',
                },
                {
                    resourceId: 2,
                    resourceType: 'guidance',
                    type: 'binary',
                    feedback: 'thumbs_down',
                },
            ],
        }

        const {result} = renderHook(() => useAIAgentResources(messageFeedback))
        expect(result.current).toEqual({
            actions: [
                {id: 1, name: 'Snooze', feedback: 'thumbs_up'},
                {id: 2, name: 'Close', feedback: 'thumbs_down'},
                {id: 3, name: 'Cancel', feedback: null},
            ],
            guidance: [
                {id: 1, name: 'Cancelling an order', feedback: 'thumbs_up'},
                {id: 2, name: 'Refund', feedback: 'thumbs_down'},
                {id: 3, name: 'Shipping', feedback: null},
            ],
            knowledge: [
                {
                    type: 'article',
                    id: 234,
                    name: 'Refund Policy',
                    feedback: null,
                },
                {
                    type: 'external_snippet',
                    id: 235,
                    name: 'Shipping times',
                    url: 'https://artemis.gorgias.help/en-US#article-13609',
                    feedback: null,
                },
                {
                    type: 'macro',
                    id: 236,
                    name: 'Damaged items',
                    feedback: null,
                },
            ],
        })
    })
})
