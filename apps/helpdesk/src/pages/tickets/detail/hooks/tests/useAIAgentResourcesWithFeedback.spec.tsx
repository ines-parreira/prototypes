import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ReportIssueOption } from 'models/aiAgentFeedback/constants'
import type {
    MessageFeedback,
    TicketFeedback,
} from 'models/aiAgentFeedback/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { ActionStatus } from '../../components/AIAgentFeedbackBar/types'
import type { ActionWithFeedback } from '../useAIAgentResourcesWithFeedback'
import {
    useAIAgentResourcesWithFeedback,
    useAIAgentResourcesWithFeedbackUtil,
} from '../useAIAgentResourcesWithFeedback'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = {}

const messageFeedback: MessageFeedback = {
    accountId: 1234,
    shopName: 'fast-cars',
    shopType: 'shopify',
    helpCenterId: 1234,
    guidanceHelpCenterId: 1235,
    snippetHelpCenterId: 1236,
    messageId: 1137369657,
    executionId: '923665aa-5081-49b3-9cca-2ad6e1823175',
    summary:
        'AI Agent sent a response and left the ticket open pending further information from the customer.',
    orders: [{ id: 3324, name: '#3324', url: 'https://gorgias.com' }],
    allowsFeedback: true,
    feedbackOnMessage: [
        {
            type: 'issue',
            feedback: ReportIssueOption.IncorrectLanguageUsed,
        },
    ],
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
    draftMessage: {
        content: null,
        ticketActions: null,
    },
}

describe('useAIAgentResourcesWithFeedback', () => {
    const renderHookWithStore = (messageFeedback?: MessageFeedback) =>
        renderHook(() => useAIAgentResourcesWithFeedback(messageFeedback), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })
    it('returns empty arrays if no messageFeedback is provided', () => {
        const { result } = renderHookWithStore()
        expect(result.current).toEqual({
            actions: [],
            guidance: [],
            knowledge: [],
        })
    })

    it('enrich actions with not confirmed status', () => {
        const mockCheckIfMessageFeedbackHasHardAction = jest
            .spyOn(
                useAIAgentResourcesWithFeedbackUtil,
                'checkIfMessageFeedbackHasHardAction',
            )
            .mockReturnValue(false)

        const mockGetPreviousMessageWithHardAction = jest
            .spyOn(
                useAIAgentResourcesWithFeedbackUtil,
                'getPreviousMessageWithHardAction',
            )
            .mockReturnValue({
                hardActionCount: 1,
                previousMessageWithHardAction: {
                    id: 2,
                    hardAction: {
                        id: 102,
                        name: 'Refund order',
                    },
                },
            })
        const { result } = renderHookWithStore(messageFeedback)
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
                {
                    id: 102,
                    name: 'Refund order',
                    feedback: null,
                    type: 'hard_action',
                    status: ActionStatus.NOT_CONFIRMED,
                },
            ],
            guidance: [
                { id: 1, name: 'Cancelling an order', feedback: 'thumbs_up' },
                { id: 2, name: 'Refund', feedback: 'thumbs_down' },
                { id: 3, name: 'Shipping', feedback: null },
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

        mockCheckIfMessageFeedbackHasHardAction.mockRestore()
        mockGetPreviousMessageWithHardAction.mockRestore()
    })

    it('enrich actions with confirmed status', () => {
        const mockCheckIfMessageFeedbackHasHardAction = jest
            .spyOn(
                useAIAgentResourcesWithFeedbackUtil,
                'checkIfMessageFeedbackHasHardAction',
            )
            .mockReturnValue(false)

        const mockGetPreviousMessageWithHardAction = jest
            .spyOn(
                useAIAgentResourcesWithFeedbackUtil,
                'getPreviousMessageWithHardAction',
            )
            .mockReturnValue({
                hardActionCount: 1,
                previousMessageWithHardAction: {
                    id: 2,
                    hardAction: {
                        id: 102,
                        name: 'Refund order',
                    },
                },
            })

        const { result } = renderHookWithStore({
            ...messageFeedback,
            summary: 'AI Agent performed the Refund order action.',
        })
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
                {
                    id: 102,
                    name: 'Refund order',
                    feedback: null,
                    type: 'hard_action',
                    status: ActionStatus.CONFIRMED,
                },
            ],
            guidance: [
                { id: 1, name: 'Cancelling an order', feedback: 'thumbs_up' },
                { id: 2, name: 'Refund', feedback: 'thumbs_down' },
                { id: 3, name: 'Shipping', feedback: null },
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

        mockCheckIfMessageFeedbackHasHardAction.mockRestore()
        mockGetPreviousMessageWithHardAction.mockRestore()
    })
})

describe('getPreviousMessageWithHardAction', () => {
    it('should return null when there are no messages', () => {
        const ticketFeedback = { messages: [] }
        const messageFeedback: MessageFeedback = {
            messageId: 1,
        } as MessageFeedback

        const result =
            useAIAgentResourcesWithFeedbackUtil.getPreviousMessageWithHardAction(
                ticketFeedback,
                messageFeedback,
            )

        expect(result).toEqual({
            hardActionCount: 0,
            previousMessageWithHardAction: null,
        })
    })

    it('should return null when no actions are found before messageFeedback', () => {
        const ticketFeedback = {
            messages: [
                { messageId: 1, actions: [] },
                { messageId: 2, actions: [] },
            ],
        } as unknown as TicketFeedback
        const messageFeedback: MessageFeedback = {
            messageId: 3,
        } as MessageFeedback

        const result =
            useAIAgentResourcesWithFeedbackUtil.getPreviousMessageWithHardAction(
                ticketFeedback,
                messageFeedback,
            )

        expect(result).toEqual({
            hardActionCount: 0,
            previousMessageWithHardAction: null,
        })
    })

    it('should return previous message with a hard action', () => {
        const ticketFeedback = {
            messages: [
                { messageId: 1, actions: [] },
                {
                    messageId: 2,
                    actions: [
                        { id: 101, name: 'Cancel order', type: 'hard_action' },
                    ],
                },
            ],
        } as unknown as TicketFeedback
        const messageFeedback: MessageFeedback = {
            messageId: 3,
        } as MessageFeedback

        const result =
            useAIAgentResourcesWithFeedbackUtil.getPreviousMessageWithHardAction(
                ticketFeedback,
                messageFeedback,
            )

        expect(result).toEqual({
            hardActionCount: 1,
            previousMessageWithHardAction: {
                id: 2,
                hardAction: {
                    id: 101,
                    name: 'Cancel order',
                    type: 'hard_action',
                },
            },
        })
    })

    it('should return the last hard action before messageFeedback', () => {
        const ticketFeedback = {
            messages: [
                {
                    messageId: 1,
                    actions: [
                        { id: 101, name: 'Cancel order', type: 'hard_action' },
                    ],
                },
                {
                    messageId: 2,
                    actions: [
                        { id: 102, name: 'Refund order', type: 'hard_action' },
                    ],
                },
            ],
        } as unknown as TicketFeedback
        const messageFeedback: MessageFeedback = {
            messageId: 3,
        } as MessageFeedback

        const result =
            useAIAgentResourcesWithFeedbackUtil.getPreviousMessageWithHardAction(
                ticketFeedback,
                messageFeedback,
            )

        expect(result).toEqual({
            hardActionCount: 2,
            previousMessageWithHardAction: {
                id: 2,
                hardAction: {
                    id: 102,
                    name: 'Refund order',
                    type: 'hard_action',
                },
            },
        })
    })

    it('should stop processing actions once the messageFeedback ID is reached', () => {
        const ticketFeedback = {
            messages: [
                {
                    messageId: 1,
                    actions: [
                        { id: 101, name: 'Cancel order', type: 'hard_action' },
                    ],
                },
                {
                    messageId: 2,
                    actions: [
                        { id: 102, name: 'Refund order', type: 'hard_action' },
                    ],
                },
                {
                    messageId: 3, // This message is after the feedback message, so it should be ignored
                    actions: [
                        { id: 103, name: 'Close ticket', type: 'hard_action' },
                    ],
                },
            ],
        } as unknown as TicketFeedback
        const messageFeedback: MessageFeedback = {
            messageId: 3,
        } as MessageFeedback

        const result =
            useAIAgentResourcesWithFeedbackUtil.getPreviousMessageWithHardAction(
                ticketFeedback,
                messageFeedback,
            )

        expect(result).toEqual({
            hardActionCount: 2,
            previousMessageWithHardAction: {
                id: 2,
                hardAction: {
                    id: 102,
                    name: 'Refund order',
                    type: 'hard_action',
                },
            },
        })
    })
})

describe('checkIfMessageFeedbackHasHardAction', () => {
    it('should return false when messageFeedback is null', () => {
        const messageFeedback = null
        const actionsWithFeedback: ActionWithFeedback = []
        const previousMessageWithHardAction = null

        const result =
            useAIAgentResourcesWithFeedbackUtil.checkIfMessageFeedbackHasHardAction(
                actionsWithFeedback,
                previousMessageWithHardAction,
                messageFeedback,
            )

        expect(result).toBe(false)
    })

    it('should return false when actionsWithFeedback does not contain previous hard action', () => {
        const messageFeedback: MessageFeedback = {
            messageId: 1,
        } as MessageFeedback
        const actionsWithFeedback = [
            {
                id: 101,
                name: 'Soft Action 1',
                type: 'soft_action',
                feedback: 'thumbs_up' as const,
            },
        ] as unknown as ActionWithFeedback
        const previousMessageWithHardAction = {
            id: 1,
            hardAction: { id: 102, name: 'Hard Action 1' },
        }

        const result =
            useAIAgentResourcesWithFeedbackUtil.checkIfMessageFeedbackHasHardAction(
                actionsWithFeedback,
                previousMessageWithHardAction,
                messageFeedback,
            )

        expect(result).toBe(false)
    })

    it('should return true when actionsWithFeedback contains previous hard action', () => {
        const messageFeedback: MessageFeedback = {
            messageId: 1,
        } as MessageFeedback
        const actionsWithFeedback = [
            {
                id: 101,
                name: 'Soft Action 1',
                type: 'soft_action',
                feedback: 'thumbs_up',
            },
            {
                id: 102,
                name: 'Hard Action 1',
                type: 'hard_action',
                feedback: 'thumbs_down',
            },
        ] as unknown as ActionWithFeedback
        const previousMessageWithHardAction = {
            id: 1,
            hardAction: { id: 102, name: 'Hard Action 1' },
        }

        const result =
            useAIAgentResourcesWithFeedbackUtil.checkIfMessageFeedbackHasHardAction(
                actionsWithFeedback,
                previousMessageWithHardAction,
                messageFeedback,
            )

        expect(result).toBe(true)
    })

    it('should return false when previousMessageWithHardAction is null', () => {
        const messageFeedback: MessageFeedback = {
            messageId: 1,
        } as MessageFeedback
        const actionsWithFeedback = [
            {
                id: 102,
                name: 'Hard Action 1',
                type: 'hard_action',
                feedback: 'thumbs_down',
            },
        ] as unknown as ActionWithFeedback
        const previousMessageWithHardAction = null

        const result =
            useAIAgentResourcesWithFeedbackUtil.checkIfMessageFeedbackHasHardAction(
                actionsWithFeedback,
                previousMessageWithHardAction,
                messageFeedback,
            )

        expect(result).toBe(false)
    })

    it('should return false when previous hard action id does not match any action in actionsWithFeedback', () => {
        const messageFeedback: MessageFeedback = {
            messageId: 1,
        } as MessageFeedback
        const actionsWithFeedback = [
            {
                id: 103,
                name: 'Hard Action 2',
                type: 'hard_action',
                feedback: 'thumbs_up',
            },
        ] as unknown as ActionWithFeedback
        const previousMessageWithHardAction = {
            id: 1,
            hardAction: { id: 102, name: 'Hard Action 1' },
        }

        const result =
            useAIAgentResourcesWithFeedbackUtil.checkIfMessageFeedbackHasHardAction(
                actionsWithFeedback,
                previousMessageWithHardAction,
                messageFeedback,
            )

        expect(result).toBe(false)
    })
})
