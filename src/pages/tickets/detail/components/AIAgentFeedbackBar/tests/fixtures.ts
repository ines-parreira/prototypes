import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {MessageFeedback} from 'models/aiAgentFeedback/types'

export const messageFeedback: MessageFeedback = {
    shopType: 'shopify',
    shopName: 'fast-cars',
    helpCenterId: 1234,
    guidanceHelpCenterId: 1235,
    snippetHelpCenterId: 1236,
    messageId: 1137369657,
    summary:
        'AI Agent sent a response and left the ticket open pending further information from the customer.',
    orders: [{id: 3324, url: 'https://gorgias.com'}],
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
    allowsFeedback: false,
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
        {
            resourceId: 3,
            resourceType: 'guidance',
            type: 'binary',
            feedback: null,
        },
        {
            resourceId: 234,
            resourceType: 'article',
            type: 'binary',
            feedback: 'thumbs_up',
        },
        {
            resourceId: 235,
            resourceType: 'external_snippet',
            type: 'binary',
            feedback: 'thumbs_down',
        },
        {
            resourceId: 236,
            resourceType: 'macro',
            type: 'binary',
            feedback: null,
        },
    ],
    feedbackOnMessage: [
        {type: 'binary', feedback: 'thumbs_up'},
        {type: 'issue', feedback: ReportIssueOption.IncorrectLanguageUsed},
        {type: 'issue', feedback: ReportIssueOption.TooVerbose},
        {type: 'issue', feedback: ReportIssueOption.OverPromising},
        {type: 'resource', resourceType: 'article', resourceId: 234},
    ],
}
