import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    useDeleteAIAgentTicketMessagesFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import type {
    DeleteMessageFeedback,
    SubmitMessageFeedback,
} from 'models/aiAgentFeedback/types'
import type { TicketMessage } from 'models/ticket/types'
import { setAgentFeedbackMessageStatus } from 'state/agents/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import type { ResourceSection } from '../../components/AIAgentFeedbackBar/types'
import { FeedbackStatus } from '../../components/AIAgentFeedbackBar/types'
import { useAIAgentSendFeedback } from '../useAIAgentSendFeedback'

const queryClient = mockQueryClient()

jest.mock('models/aiAgentFeedback/queries')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock('state/notifications/actions')
jest.mock('state/agents/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('state/agents/actions', () => ({
    setAgentFeedbackMessageStatus: jest.fn(),
}))
const mockedSetAgentFeedbackMessageStatus = jest.mocked(
    setAgentFeedbackMessageStatus,
)

const mockStore = configureMockStore([thunk])
const store = {
    tags: fromJS({
        items: [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' },
            { name: 'tag4' },
        ],
    }),
}

const mockedUseSubmitAIAgentTicketMessagesFeedback = assumeMock(
    useSubmitAIAgentTicketMessagesFeedback,
)

const mockedUseDeleteAIAgentTicketMessagesFeedback = assumeMock(
    useDeleteAIAgentTicketMessagesFeedback,
)

const message = {
    ticket_id: '1',
    id: '2',
} as unknown as TicketMessage

const payload: SubmitMessageFeedback = {
    feedbackOnMessage: [],
    feedbackOnResource: [
        {
            resourceType: 'soft_action',
            resourceId: 3,
            type: 'binary',
            feedback: 'thumbs_up',
        },
    ],
}

const deletePayload: DeleteMessageFeedback = {
    feedbackOnMessage: [
        {
            type: 'resource',
            resourceType: 'article',
            resourceId: 1,
        },
    ],
    feedbackOnResource: [],
}

describe('useAIAgentSendFeedback', () => {
    const mockSetAgentFeedbackMessageStatus = jest.fn()

    beforeEach(() => {
        queryClient.clear()
        mockedDispatch.mockClear()

        mockedUseSubmitAIAgentTicketMessagesFeedback.mockReturnValue({
            mutateAsync: jest.fn().mockReturnValue({ data: {} }),
            isLoading: false,
        } as unknown as ReturnType<
            typeof useSubmitAIAgentTicketMessagesFeedback
        >)

        mockedUseDeleteAIAgentTicketMessagesFeedback.mockReturnValue({
            mutateAsync: jest.fn().mockReturnValue({ data: {} }),
            isLoading: false,
        } as unknown as ReturnType<
            typeof useDeleteAIAgentTicketMessagesFeedback
        >)
        mockedSetAgentFeedbackMessageStatus.mockImplementation(
            mockSetAgentFeedbackMessageStatus,
        )
    })

    it('should optimistically update only the targeted message feedback on mutate', async () => {
        const getQueryDataMock = jest.spyOn(queryClient, 'getQueryData')
        const setQueryDataMock = jest.spyOn(queryClient, 'setQueryData')

        const previousFeedback = {
            data: {
                messages: [
                    {
                        messageId: 2,
                        feedbackOnMessage: [
                            {
                                type: 'resource',
                                resourceType: 'article',
                                resourceId: 11,
                            },
                        ],
                        feedbackOnResource: [
                            {
                                resourceType: 'soft_action',
                                resourceId: 7,
                                type: 'binary',
                                feedback: 'thumbs_up',
                            },
                        ],
                    },
                    {
                        messageId: 3,
                        feedbackOnMessage: [],
                        feedbackOnResource: [],
                    },
                ],
            },
        }

        getQueryDataMock.mockReturnValue(previousFeedback as any)

        const payloadWithMessageFeedback: SubmitMessageFeedback = {
            feedbackOnMessage: [{ type: 'note', feedback: 'new feedback' }],
            feedbackOnResource: payload.feedbackOnResource,
        }

        renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]?.onMutate?.(
            [2, payloadWithMessageFeedback],
        )

        const nextData = setQueryDataMock.mock.calls[0]?.[1] as any

        expect(nextData.data.messages).toEqual([
            {
                messageId: 2,
                feedbackOnMessage: [
                    { type: 'note', feedback: 'new feedback' },
                    {
                        type: 'resource',
                        resourceType: 'article',
                        resourceId: 11,
                    },
                ],
                feedbackOnResource: [
                    {
                        resourceType: 'soft_action',
                        resourceId: 3,
                        type: 'binary',
                        feedback: 'thumbs_up',
                    },
                    {
                        resourceType: 'soft_action',
                        resourceId: 7,
                        type: 'binary',
                        feedback: 'thumbs_up',
                    },
                ],
            },
            {
                messageId: 3,
                feedbackOnMessage: [],
                feedbackOnResource: [],
            },
        ])
    })

    it('should send feedback', async () => {
        const cancelQueryMock = jest.spyOn(queryClient, 'cancelQueries')
        const getQueryDataMock = jest.spyOn(queryClient, 'getQueryData')

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(message, payload)

        mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]
            ?.onMutate!([2, payload])

        await waitFor(() => {
            expect(cancelQueryMock).toHaveBeenCalled()
            expect(getQueryDataMock).toHaveBeenCalled()

            expect(
                mockedUseSubmitAIAgentTicketMessagesFeedback,
            ).toHaveBeenCalled()
        })
    })

    it('should send notification on error', async () => {
        const setQueryDataMock = jest.spyOn(queryClient, 'setQueryData')

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(message, payload)

        mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]?.onError!(
            { error: new Error('error') },
            [1, payload],
            [2, payload],
        )

        expect(setQueryDataMock).toHaveBeenCalled()

        expect(notify).toHaveBeenCalledWith({
            message:
                'There was an error sending the feedback. Please try again.',
            status: NotificationStatus.Error,
        })
    })

    it('should not call setQueryData on error if context is undefined', async () => {
        const setQueryDataMock = jest.spyOn(queryClient, 'setQueryData')

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(message, payload)

        mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]?.onError!(
            { error: new Error('error') },
            [1, payload],
            undefined,
        )

        expect(setQueryDataMock).not.toHaveBeenCalled()
    })

    it('should invalidate query on success', async () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(message, payload)

        mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]
            ?.onSuccess!(
            axiosSuccessResponse(payload),
            [1, payload],
            [2, payload],
        )

        expect(invalidateQueryMock).toHaveBeenCalled()
    })

    it('should delete feedback', async () => {
        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentDeleteFeedback(message, {
            feedbackOnMessage: [
                { type: 'resource', resourceType: 'article', resourceId: 1 },
            ],
            feedbackOnResource: [],
        })

        expect(mockedUseDeleteAIAgentTicketMessagesFeedback).toHaveBeenCalled()
    })

    it('should invalidate query on delete success', async () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentDeleteFeedback(message, deletePayload)

        mockedUseDeleteAIAgentTicketMessagesFeedback.mock.calls[0][0]
            ?.onSuccess!(
            axiosSuccessResponse(deletePayload),
            [1, deletePayload],
            [2, deletePayload],
        )

        await waitFor(() => expect(invalidateQueryMock).toHaveBeenCalled())
    })

    it('should dispatch a notification on delete error', async () => {
        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentDeleteFeedback(message, deletePayload)

        mockedUseDeleteAIAgentTicketMessagesFeedback.mock.calls[0][0]?.onError!(
            { error: new Error('error') },
            [1, deletePayload],
            [2, deletePayload],
        )

        expect(notify).toHaveBeenCalledWith({
            message:
                'There was an error deleting the feedback. Please try again.',
            status: NotificationStatus.Error,
        })
    })

    it('should dispatch "SAVED" action on successful feedback submission', async () => {
        const resourceSection = 'someSection' as ResourceSection

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(
            message,
            payload,
            resourceSection,
        )

        // Verify the dispatch for "SAVING" action
        expect(mockSetAgentFeedbackMessageStatus).toHaveBeenCalledWith(
            FeedbackStatus.SAVING,
            resourceSection,
        )

        mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]
            ?.onSuccess!(
            axiosSuccessResponse(payload),
            [1, payload, resourceSection],
            [2, payload, resourceSection],
        )

        // Check that dispatch was called with "SAVED" action in onSuccess
        expect(mockSetAgentFeedbackMessageStatus).toHaveBeenCalledWith(
            FeedbackStatus.SAVED,
            resourceSection,
        )
    })

    it('should dispatch "ERROR" action on failed feedback submission', async () => {
        const resourceSection = 'someSection' as ResourceSection

        const { result } = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(
            message,
            payload,
            resourceSection,
        )

        // Verify the dispatch for "SAVING" action
        expect(mockSetAgentFeedbackMessageStatus).toHaveBeenCalledWith(
            FeedbackStatus.SAVING,
            resourceSection,
        )

        mockedUseSubmitAIAgentTicketMessagesFeedback.mock.calls[0][0]?.onError!(
            { error: new Error('error') },
            [1, deletePayload, resourceSection],
            [2, deletePayload, resourceSection],
        )

        // Check that dispatch was called with "ERROR" action
        expect(mockSetAgentFeedbackMessageStatus).toHaveBeenCalledWith(
            FeedbackStatus.ERROR,
            resourceSection,
        )
    })
})
