import { ReportIssueOption } from 'models/aiAgentFeedback/constants'
import { MessageFeedback } from 'models/aiAgentFeedback/types'

export const messageFeedback: MessageFeedback = {
    accountId: 1234,
    shopType: 'shopify',
    shopName: 'fast-cars',
    helpCenterId: 1234,
    guidanceHelpCenterId: 1235,
    snippetHelpCenterId: 1236,
    messageId: 1137369657,
    executionId: '923665aa-5081-49b3-9cca-2ad6e1823175',
    summary:
        'AI Agent sent a response and left the ticket open pending further information from the customer.',
    orders: [{ id: 3324, url: 'https://gorgias.com', name: '#3324' }],
    actions: [
        { type: 'soft_action', id: 1, name: 'Get loyalty points' },
        { type: 'soft_action', id: 2, name: 'Get shipping address' },
        { type: 'hard_action', id: 3, name: 'Change shipping address' },
        { type: 'hard_action', id: 4, name: 'Refund order' },
    ],
    guidance: [
        { id: 1, name: 'Cancelling an order' },
        { id: 2, name: 'Refund' },
        { id: 3, name: 'Shipping' },
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
        { type: 'macro', id: 236, name: 'Damaged items' },
    ],
    allowsFeedback: false,
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
            resourceId: 5,
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
        { type: 'binary', feedback: 'thumbs_up' },
        { type: 'issue', feedback: ReportIssueOption.IncorrectLanguageUsed },
        { type: 'issue', feedback: ReportIssueOption.TooVerbose },
        { type: 'issue', feedback: ReportIssueOption.OverPromising },
        { type: 'resource', resourceType: 'article', resourceId: 234 },
    ],
    draftMessage: {
        content: 'test content',
        ticketActions: null,
    },
}
