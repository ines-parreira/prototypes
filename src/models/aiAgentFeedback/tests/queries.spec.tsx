import React from 'react'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'

import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {
    useGetAiAgentFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
    useDeleteAIAgentTicketMessagesFeedback,
} from '../queries'
import {
    deleteAIAgentTicketMessagesFeedback,
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
} from '../resources'
import {DeleteMessageFeedback, SubmitMessageFeedback} from '../types'
import {ReportIssueOption} from '../constants'

jest.mock('../resources', () => ({
    getAIAgentTicketMessagesFeedback: jest.fn(),
    submitAIAgentTicketMessagesFeedback: jest.fn(),
    deleteAIAgentTicketMessagesFeedback: jest.fn(),
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        },
    },
    ticket: fromJS({
        messages: [
            {
                id: 1,
                created_datetime: '2024-06-26T05:37:16+00:00',
                sender: {
                    email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS,
                },
                from_agent: true,
            },
            {
                id: 2,
                created_datetime: '2024-06-26T05:37:16+00:00',
                sender: {
                    email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS,
                },
                from_agent: true,
            },
        ],
    }),
} as RootState)

const wrapper = ({children}: any) => (
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('useGetAiAgentFeedback', () => {
    it('should call getAIAgentTicketMessagesFeedback with the correct messageIds', async () => {
        const mockFeedback = [
            {messageId: 1, feedback: 1},
            {messageId: 2, feedback: -1},
        ]
        ;(getAIAgentTicketMessagesFeedback as jest.Mock).mockResolvedValue(
            mockFeedback
        )

        const {result, waitForNextUpdate} = renderHook(
            () => useGetAiAgentFeedback(),
            {wrapper}
        )

        expect(result.current.isLoading).toBe(true)

        await waitForNextUpdate()

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBe(mockFeedback)
        expect(getAIAgentTicketMessagesFeedback).toHaveBeenCalled()
    })
})

describe('useSubmitAIAgentTicketMessagesFeedback', () => {
    it('should call submitAIAgentTicketMessagesFeedback with the correct ticketId and messageId', async () => {
        const messageId = 456
        const feedback: SubmitMessageFeedback = {
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
        ;(submitAIAgentTicketMessagesFeedback as jest.Mock).mockResolvedValue(
            feedback
        )

        const {result, waitFor} = renderHook(
            () => useSubmitAIAgentTicketMessagesFeedback(),
            {wrapper}
        )

        act(() => result.current.mutate([messageId, feedback]))

        await waitFor(() => {
            expect(submitAIAgentTicketMessagesFeedback).toHaveBeenCalledWith(
                messageId,
                feedback
            )
        })
    })
})

describe('useDeleteAIAgentTicketMessagesFeedback', () => {
    it('should call deleteAIAgentTicketMessagesFeedback with the correct ticketId and messageId', async () => {
        const messageId = 456
        const feedback: DeleteMessageFeedback = {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    type: 'issue',
                    feedback: ReportIssueOption.IncorrectLanguageUsed,
                },
            ],
        }
        ;(deleteAIAgentTicketMessagesFeedback as jest.Mock).mockResolvedValue(
            feedback
        )

        const {result, waitFor} = renderHook(
            () => useDeleteAIAgentTicketMessagesFeedback(),
            {wrapper}
        )

        act(() => result.current.mutate([messageId, feedback]))

        await waitFor(() => {
            expect(deleteAIAgentTicketMessagesFeedback).toHaveBeenCalledWith(
                messageId,
                feedback
            )
        })
    })
})
