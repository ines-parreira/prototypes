import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { ReportIssueOption } from '../constants'
import {
    useDeleteAIAgentTicketMessagesFeedback,
    useGetAiAgentFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from '../queries'
import {
    deleteAIAgentTicketMessagesFeedback,
    getAIAgentTicketMessagesFeedback,
    submitAIAgentTicketMessagesFeedback,
} from '../resources'
import { DeleteMessageFeedback, SubmitMessageFeedback } from '../types'

jest.mock('../resources', () => ({
    getAIAgentTicketMessagesFeedback: jest.fn(),
    submitAIAgentTicketMessagesFeedback: jest.fn(),
    deleteAIAgentTicketMessagesFeedback: jest.fn(),
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ticket: fromJS({
        messages: [
            {
                id: 1,
                created_datetime: '2024-06-26T05:37:16+00:00',
                sender: {
                    email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                },
                from_agent: true,
            },
            {
                id: 2,
                created_datetime: '2024-06-26T05:37:16+00:00',
                sender: {
                    email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                },
                from_agent: true,
            },
        ],
    }),
} as RootState)

const wrapper = ({ children }: any) => (
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('useGetAiAgentFeedback', () => {
    it('should call getAIAgentTicketMessagesFeedback with the correct messageIds', async () => {
        const mockFeedback = [
            { messageId: 1, feedback: 1 },
            { messageId: 2, feedback: -1 },
        ]
        ;(getAIAgentTicketMessagesFeedback as jest.Mock).mockResolvedValue(
            mockFeedback,
        )

        const { result } = renderHook(() => useGetAiAgentFeedback(), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBe(mockFeedback)
            expect(getAIAgentTicketMessagesFeedback).toHaveBeenCalled()
        })
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
                { type: 'binary', feedback: 'thumbs_up' },
                { type: 'resource', resourceType: 'article', resourceId: 2 },
            ],
        }
        ;(submitAIAgentTicketMessagesFeedback as jest.Mock).mockResolvedValue(
            feedback,
        )

        const { result } = renderHook(
            () => useSubmitAIAgentTicketMessagesFeedback(),
            { wrapper },
        )

        act(() => result.current.mutate([messageId, feedback]))

        await waitFor(() => {
            expect(submitAIAgentTicketMessagesFeedback).toHaveBeenCalledWith(
                messageId,
                feedback,
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
            feedback,
        )

        const { result } = renderHook(
            () => useDeleteAIAgentTicketMessagesFeedback(),
            { wrapper },
        )

        act(() => result.current.mutate([messageId, feedback]))

        await waitFor(() => {
            expect(deleteAIAgentTicketMessagesFeedback).toHaveBeenCalledWith(
                messageId,
                feedback,
            )
        })
    })
})
