import React from 'react'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render, screen} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RootState} from 'state/types'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {assumeMock} from 'utils/testing'
import {message} from 'models/ticket/tests/mocks'
import {SegmentEvent, logEvent} from 'common/segment'
import {messageFeedback} from '../../AIAgentFeedbackBar/tests/fixtures'
import AIAgentDraftMessage from '../AIAgentDraftMessage'

jest.mock('state/currentAccount/selectors')
jest.mock('models/aiAgentFeedback/queries')
jest.mock('state/ticket/actions', () => ({
    applyMacro: jest.fn(),
    applyMacroAction: jest.fn(),
    updateTicketMessage: jest.fn(),
    setInTicketSuggestionState: jest.fn(() => ({
        type: 'SET_IN_TICKET_SUGGESTION_STATE',
        payload: 'pending',
    })),
}))
jest.mock('common/segment')

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const getCurrentAccountIdMock = assumeMock(getCurrentAccountId)
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const logEventMock = assumeMock(logEvent)

const mockMessage = {
    ...message,
    id: messageFeedback.messageId,
}

const mockStore = configureMockStore([thunk])
const defaultState: Partial<RootState> = {}

describe('AIAgentDraftMessage', () => {
    let store = mockStore(defaultState)

    const defaultProps = {
        ticketId: 1,
        message: mockMessage,
        isTrial: false,
    }
    beforeEach(() => {
        getCurrentAccountIdMock.mockReturnValue(1)
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [messageFeedback, mockMessage],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)
        store = mockStore({
            ui: {editor: {isFocused: false}},
            ticket: fromJS({_internal: {isPartialUpdating: false}}),
        })
    })

    it('should get accountId from useAppSelector', () => {
        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...defaultProps} />
            </Provider>
        )

        expect(getCurrentAccountIdMock).toHaveBeenCalled()
    })

    it('should log event to ai-agent-copied-to-editor segment with qa_failed banner when isTrial is false', () => {
        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...defaultProps} />
            </Provider>
        )

        expect(screen.getByText('Copy to Editor')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Copy to Editor'))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentCopiedToEditor,
            {
                accountId: 1,
                banner: 'qa_failed',
            }
        )
    })

    it('should log event to ai-agent-copied-to-editor segment with trial banner when isTrial is true', () => {
        const props = {
            ...defaultProps,
            isTrial: true,
        }

        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...props} />
            </Provider>
        )

        expect(screen.getByText('Copy to Editor')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Copy to Editor'))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentCopiedToEditor,
            {
                accountId: 1,
                banner: 'trial',
            }
        )
    })

    it('render empty message when feedbackMessage is not present', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {...messageFeedback, summary: undefined},
                        mockMessage,
                    ],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...defaultProps} />
            </Provider>
        )

        expect(screen.queryByText('Copy to Editor')).toBeInTheDocument()
    })
})
