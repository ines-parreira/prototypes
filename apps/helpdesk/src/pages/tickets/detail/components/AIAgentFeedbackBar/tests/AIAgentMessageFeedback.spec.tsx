import { ldClientMock } from '@repo/feature-flags/testing'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useCookies } from 'react-cookie'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import type { SubmitMessageFeedback } from 'models/aiAgentFeedback/types'
import type { TicketMessage } from 'models/ticket/types'
import type { RootState, StoreDispatch } from 'state/types'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import AIAgentMessageFeedback, {
    FEEDBACK_MESSAGE_ACTIONS_TEST_ID,
    FEEDBACK_MESSAGE_GUIDANCE_TEST_ID,
    FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID,
} from '../AIAgentMessageFeedback'
import { messageFeedback } from './fixtures'

jest.mock('hooks/useAppDispatch')
jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('react-cookie')
jest.mock('hooks/useHasAgentPrivileges')
jest.mock('@repo/logging')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => children,
    useHelpCenterApi: jest.fn(() => ({ client: {} })),
}))

const queryClient = mockQueryClient()
const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)
const mockDispatch = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(mockDispatch)

const mockMessage = {
    ticket_id: 1,
    id: messageFeedback.messageId,
} as unknown as TicketMessage

const ticketsStore: Partial<RootState> = {
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ...ticketsStore,
    ui: {
        ticketAIAgentFeedback: {
            feedback: {
                message: mockMessage,
            },
        },
    },
} as RootState)
jest.mock('state/ticket/actions', () => ({
    addTag: jest.fn(),
    removeTag: jest.fn(),
}))
store.dispatch = jest.fn()

const mockSetCookie = jest.fn()
const mockHandleSubmitFeedback = jest.fn()
const mockHandleDeleteFeedback = jest.fn()
jest.mock('../../../hooks/useAIAgentSendFeedback', () => {
    return {
        useAIAgentSendFeedback: () => ({
            aiAgentSendFeedback: mockHandleSubmitFeedback,
            aiAgentDeleteFeedback: mockHandleDeleteFeedback,
        }),
    }
})

describe('AIAgentMessageFeedback', () => {
    beforeEach(() => {
        getSelectedAIMessageMock.mockReturnValue(mockMessage)
        ;(useCookies as jest.Mock).mockReturnValue([
            { TOOLTIP_COOKIE_NAME: false },
            mockSetCookie,
        ])
        ;(useHasAgentPrivileges as jest.Mock).mockReturnValue(true)
        ldClientMock.allFlags.mockReturnValue({})
    })

    afterEach(() => {
        queryClient.clear()
    })

    it.each([
        { testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions' },
        { testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance' },
        { testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge' },
    ])('$name - renders thumbs up icon for positive feedback', ({ testId }) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>,
        )

        const positiveFeedbackElement = screen
            .getAllByTestId(testId)[0]
            .querySelector('.feedback i.material-icons')
            ?.parentElement?.parentElement
        expect(positiveFeedbackElement).toHaveClass('positiveFeedback')
    })

    it.each([
        { testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions' },
        { testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance' },
        { testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge' },
    ])(
        '$name - renders thumbs down icon for negative feedback',
        ({ testId }) => {
            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <AIAgentMessageFeedback
                            messageFeedback={messageFeedback}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            const negativeFeedbackElement = screen
                .getAllByTestId(testId)[1]
                .querySelector('.feedback i.material-icons')
                ?.parentElement?.parentElement
            expect(negativeFeedbackElement).toHaveClass('negativeFeedback')
        },
    )

    it.each([
        { testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions' },
        { testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance' },
        { testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge' },
    ])('$name - renders thumbs up icon for neutral feedback', ({ testId }) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>,
        )

        const feedbackActionsElement = screen
            .getAllByTestId(testId)[2]
            .querySelector('.feedback i.material-icons-outlined')?.parentElement
        expect(feedbackActionsElement).not.toHaveClass('positiveFeedback')
        expect(feedbackActionsElement).not.toHaveClass('negativeFeedback')
    })

    it('handle submit note feedback if note is not empty', () => {
        const textContent = 'test note'
        const payload: SubmitMessageFeedback = {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    type: 'note',
                    feedback: textContent,
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>,
        )

        const noteFeedback = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id',
        )

        fireEvent.blur(noteFeedback, {
            currentTarget: {
                textContent: 'test note',
            } as unknown as EventTarget,
        })
        ;async () => {
            expect(noteFeedback.textContent).toBe('test note')
            expect(mockHandleSubmitFeedback).toHaveBeenCalledWith(
                messageFeedback,
                payload,
            )

            return await Promise.resolve()
        }
    })

    it('handle delete note feedback if note is empty', () => {
        const textContent = ''
        const payload: SubmitMessageFeedback = {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    type: 'note',
                    feedback: textContent,
                },
            ],
        }
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>,
        )

        const noteFeedback = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id',
        )

        fireEvent.blur(noteFeedback, {
            currentTarget: {
                textContent: '',
            } as unknown as EventTarget,
        })
        ;async () => {
            expect(noteFeedback).toHaveValue('')
            expect(mockHandleDeleteFeedback).toHaveBeenCalledWith(
                messageFeedback,
                payload,
            )

            return await Promise.resolve()
        }
    })
})
