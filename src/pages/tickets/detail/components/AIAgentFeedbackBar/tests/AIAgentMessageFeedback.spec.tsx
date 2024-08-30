import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render, screen} from '@testing-library/react'

import {QueryClientProvider} from '@tanstack/react-query'
import {useCookies} from 'react-cookie'
import {fromJS} from 'immutable'
import {assumeMock} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {TicketMessage} from 'models/ticket/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {Feedback, SubmitMessageFeedback} from 'models/aiAgentFeedback/types'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {ticket} from 'fixtures/ticket'
import {user} from 'fixtures/users'
import AIAgentMessageFeedback, {
    FEEDBACK_MESSAGE_ACTIONS_TEST_ID,
    FEEDBACK_MESSAGE_GUIDANCE_TEST_ID,
    FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID,
    FeedbackResourceSection,
    TOOLTIP_COOKIE_NAME,
} from '../AIAgentMessageFeedback'
import {ResourceSection} from '../types'
import {messageFeedback} from './fixtures'

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('react-cookie')
jest.mock('hooks/useHasAgentPrivileges')

const queryClient = mockQueryClient()
const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)

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
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
            message: mockMessage,
        },
    },
} as RootState)
jest.mock('state/ticket/actions', () => ({
    addTags: jest.fn(),
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

const resource = {
    id: 1,
    name: 'Sample Resource',
    feedback: 'thumbs_up' as const,
}
const resourceSection = 'someSection' as ResourceSection
const renderFeedbackResourceComponent = (feedback: Feedback = 'thumbs_up') =>
    render(
        <FeedbackResourceSection
            resource={{...resource, feedback}}
            resourceType="guidance"
            handleSubmitFeedback={mockHandleSubmitFeedback}
            href="https://example.com"
            dataTestId="feedback-section"
            resourceId={1}
            resourceSection={resourceSection}
        />
    )

describe('AIAgentMessageFeedback', () => {
    beforeEach(() => {
        getSelectedAIMessageMock.mockReturnValue(mockMessage)
        ;(useCookies as jest.Mock).mockReturnValue([
            {TOOLTIP_COOKIE_NAME: false},
            mockSetCookie,
        ])
        ;(useHasAgentPrivileges as jest.Mock).mockReturnValue(true)
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs up icon for positive feedback', ({testId}) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>
        )

        const positiveFeedbackElement = screen
            .getAllByTestId(testId)[0]
            .querySelector('.feedback i.material-icons')?.parentElement
        expect(positiveFeedbackElement).toHaveClass('positiveFeedback')
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs down icon for negative feedback', ({testId}) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>
        )

        const negativeFeedbackElement = screen
            .getAllByTestId(testId)[1]
            .querySelector('.feedback i.material-icons')?.parentElement
        expect(negativeFeedbackElement).toHaveClass('negativeFeedback')
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs up icon for neutral feedback', ({testId}) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentMessageFeedback messageFeedback={messageFeedback} />
                </Provider>
            </QueryClientProvider>
        )

        const feedbackActionsElement = screen
            .getAllByTestId(testId)[2]
            .querySelector('.feedback i.material-icons-outlined')?.parentElement
        expect(feedbackActionsElement).not.toHaveClass('positiveFeedback')
        expect(feedbackActionsElement).not.toHaveClass('negativeFeedback')
    })

    it('does not call handleSubmitFeedback with thumbs_down when thumbs down button is clicked', () => {
        renderFeedbackResourceComponent('thumbs_down')
        const thumbsButton = screen.getByTitle('Mark as Incorrect')
        fireEvent.click(thumbsButton)

        expect(mockHandleSubmitFeedback).not.toHaveBeenCalledWith()
        expect(mockSetCookie).not.toHaveBeenCalledWith()
    })

    it('calls handleSubmitFeedback with thumbs_up when thumbs up button is clicked', () => {
        renderFeedbackResourceComponent('thumbs_down')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        fireEvent.click(thumbsButton)

        expect(mockHandleSubmitFeedback).toHaveBeenCalledWith(
            resource.id,
            'guidance',
            'thumbs_up',
            resourceSection
        )
    })

    it('does not display the tooltip when the cookie is set', () => {
        ;(useCookies as jest.Mock).mockImplementation(() => [
            {[TOOLTIP_COOKIE_NAME]: true},
            mockSetCookie,
        ])
        renderFeedbackResourceComponent('thumbs_up')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        fireEvent.click(thumbsButton)
        const tooltip = screen.queryByTestId(`thumbs_up-${resource.id}`)
        expect(tooltip).toBeNull()
    })

    it('calls setCookie when handleBlur is triggered and cookie is not set', () => {
        renderFeedbackResourceComponent('thumbs_up')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        fireEvent.blur(thumbsButton)

        expect(mockSetCookie).toHaveBeenCalledWith(TOOLTIP_COOKIE_NAME, true)
    })

    it('does not call setCookie when handleBlur is triggered and cookie is already set', () => {
        ;(useCookies as jest.Mock).mockImplementation(() => [
            {[TOOLTIP_COOKIE_NAME]: true},
            mockSetCookie,
        ])
        renderFeedbackResourceComponent('thumbs_up')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        fireEvent.blur(thumbsButton)

        expect(mockSetCookie).not.toHaveBeenCalled()
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
            </QueryClientProvider>
        )

        const noteFeedback = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id'
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
                payload
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
            </QueryClientProvider>
        )

        const noteFeedback = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id'
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
                payload
            )

            return await Promise.resolve()
        }
    })
})
