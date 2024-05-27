import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {MessageFeedback} from 'models/aiAgentFeedback/types'

export const messageFeedback: MessageFeedback = {
    messageId: 1137369657,
    summary:
        'AI Agent sent a response and left the ticket open pending further information from the customer.',
    orders: [{id: 3324, url: 'https://gorgias.com'}],
    actions: [
        {id: 1, name: 'Snooze', feedback: 1},
        {id: 2, name: 'Close', feedback: -1},
        {id: 3, name: 'Cancel', feedback: 0},
    ],
    guidance: [
        {id: 1, name: 'Cancelling an order', feedback: 1},
        {id: 2, name: 'Refund', feedback: -1},
        {id: 3, name: 'Shipping', feedback: 0},
    ],
    knowledge: [
        {
            type: 'helpCenter',
            id: 234,
            name: 'Refund Policy',
            feedback: 1,
        },
        {
            type: 'externalURL',
            id: 234,
            name: 'Shipping times',
            url: 'https://artemis.gorgias.help/en-US#article-13609',
            feedback: -1,
        },
        {type: 'macro', id: 234, name: 'Damaged items', feedback: 0},
    ],
    reportedIssues: [
        ReportIssueOption.IncorrectLanguageUsed,
        ReportIssueOption.TooVerbose,
        ReportIssueOption.OverPromising,
    ],
}
