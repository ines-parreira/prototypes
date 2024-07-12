import {renderHook} from '@testing-library/react-hooks'
import {MessageFeedback} from 'models/aiAgentFeedback/types'
import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {useAIAgentResourcesWithFeedback} from '../useAIAgentResourcesWithFeedback'

describe('useAIAgentResourcesWithFeedback', () => {
    it('returns empty arrays if no messageFeedback is provided', () => {
        const {result} = renderHook(() => useAIAgentResourcesWithFeedback(null))
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
            helpCenterId: 1234,
            guidanceHelpCenterId: 1235,
            snippetHelpCenterId: 1236,
            messageId: 1137369657,
            executionId: '923665aa-5081-49b3-9cca-2ad6e1823175',
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
                {type: 'soft_action', id: 1, name: 'Get loyalty points'},
                {type: 'soft_action', id: 2, name: 'Get shipping address'},
                {type: 'hard_action', id: 3, name: 'Change shipping address'},
                {type: 'hard_action', id: 4, name: 'Refund order'},
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
                    resourceType: 'soft_action',
                    type: 'binary',
                    feedback: 'thumbs_up',
                },
                {
                    resourceId: 2,
                    resourceType: 'soft_action',
                    type: 'binary',
                    feedback: 'thumbs_down',
                },
                {
                    resourceId: 3,
                    resourceType: 'hard_action',
                    type: 'binary',
                    feedback: 'thumbs_up',
                },
                {
                    resourceId: 4,
                    resourceType: 'hard_action',
                    type: 'binary',
                    feedback: 'thumbs_down',
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

        const {result} = renderHook(() =>
            useAIAgentResourcesWithFeedback(messageFeedback)
        )
        expect(result.current).toEqual({
            actions: [
                {
                    id: 1,
                    name: 'Get loyalty points',
                    feedback: 'thumbs_up',
                    type: 'soft_action',
                },
                {
                    id: 2,
                    name: 'Get shipping address',
                    feedback: 'thumbs_down',
                    type: 'soft_action',
                },
                {
                    id: 3,
                    name: 'Change shipping address',
                    feedback: 'thumbs_up',
                    type: 'hard_action',
                },
                {
                    id: 4,
                    name: 'Refund order',
                    feedback: 'thumbs_down',
                    type: 'hard_action',
                },
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
