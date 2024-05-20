import React from 'react'
import {Provider} from 'react-redux'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'

import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {TicketMessage} from 'models/ticket/types'
import {assumeMock} from 'utils/testing'
import AIAgentBanner, {
    ACCURATE_RESPONSE,
    IMPROVE_RESPONSE,
} from '../AIAgentBanner'

jest.mock('state/ui/ticketAIAgentFeedback')

const mockMessage = {
    id: '1',
} as unknown as TicketMessage
const mockedChangeActiveTab = assumeMock(changeActiveTab)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)
const mockedGetSelectedAIMessage = assumeMock(getSelectedAIMessage)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        },
    },
} as RootState)
store.dispatch = jest.fn()

describe('AIAgentBanner', () => {
    it('renders the component correctly', () => {
        render(
            <Provider store={store}>
                <AIAgentBanner message={mockMessage} />
            </Provider>
        )
        expect(screen.getByText(ACCURATE_RESPONSE)).toBeInTheDocument()
    })

    it('dispatches the changeActiveTab action when improve response button is clicked', () => {
        render(
            <Provider store={store}>
                <AIAgentBanner message={mockMessage} />
            </Provider>
        )
        userEvent.click(screen.getByText(IMPROVE_RESPONSE))

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })
        expect(mockedChangeTicketMessage).toHaveBeenCalledWith({
            message: mockMessage,
        })
    })

    it('disables the improve response button when selectedAIMessage is equal to message', () => {
        mockedGetSelectedAIMessage.mockReturnValue(mockMessage)
        render(
            <Provider store={store}>
                <AIAgentBanner message={mockMessage} />
            </Provider>
        )
        expect(
            screen.getByText(IMPROVE_RESPONSE).classList.contains('isDisabled')
        ).toBe(true)
    })
})
