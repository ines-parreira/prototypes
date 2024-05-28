import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {MessageFeedback} from 'models/aiAgentFeedback/types'

export const messageFeedback: MessageFeedback = {
    messageId: 1137369657,
    summary:
        'AI Agent sent a response and left the ticket open pending further information from the customer.',
    orders: [{id: 3324, url: 'https://gorgias.com'}],
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
            type: 'helpCenter',
            id: 234,
            name: 'Refund Policy',
            feedback: 'thumbs_up',
        },
        {
            type: 'externalURL',
            id: 235,
            name: 'Shipping times',
            url: 'https://artemis.gorgias.help/en-US#article-13609',
            feedback: 'thumbs_down',
        },
        {type: 'macro', id: 236, name: 'Damaged items', feedback: null},
    ],
    reportedIssues: [
        ReportIssueOption.IncorrectLanguageUsed,
        ReportIssueOption.TooVerbose,
        ReportIssueOption.OverPromising,
    ],
    allowsFeedback: true,
    feedbackOnResource: [
        {resourceId: 234, feedback: 'thumbs_up'},
        {resourceId: 235, feedback: 'thumbs_down'},
    ],
    feedbackOnMessage: [
        {type: 'binary', feedback: 'thumbs_up'},
        {type: 'issue', feedback: 'thumbs_down'},
        {type: 'resource', resourceType: 'article', resourceId: 234},
    ],
}
