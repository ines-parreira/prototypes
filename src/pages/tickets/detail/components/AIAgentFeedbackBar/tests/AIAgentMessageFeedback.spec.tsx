import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render, screen} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {TicketMessage} from 'models/ticket/types'
import AIAgentMessageFeedback, {
    FEEDBACK_MESSAGE_ACTIONS_TEST_ID,
    FEEDBACK_MESSAGE_GUIDANCE_TEST_ID,
    FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID,
} from '../AIAgentMessageFeedback'
import {messageFeedback} from './fixtures'

jest.mock('state/ui/ticketAIAgentFeedback')

const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)

const mockMessage = {
    ticket_id: 1,
    id: messageFeedback.messageId,
} as unknown as TicketMessage

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
            message: mockMessage,
        },
    },
} as RootState)

describe('AIAgentMessageFeedback', () => {
    beforeEach(() => {
        getSelectedAIMessageMock.mockReturnValue(mockMessage)
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs up icon for positive feedback', ({testId}) => {
        render(
            <Provider store={store}>
                <AIAgentMessageFeedback messageFeedback={messageFeedback} />
            </Provider>
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
            <Provider store={store}>
                <AIAgentMessageFeedback messageFeedback={messageFeedback} />
            </Provider>
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
            <Provider store={store}>
                <AIAgentMessageFeedback messageFeedback={messageFeedback} />
            </Provider>
        )

        const feedbackActionsElement = screen
            .getAllByTestId(testId)[2]
            .querySelector('.feedback i.material-icons-outlined')?.parentElement
        expect(feedbackActionsElement).not.toHaveClass('positiveFeedback')
        expect(feedbackActionsElement).not.toHaveClass('negativeFeedback')
    })
})
