import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import useMeasure from 'hooks/useMeasure'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { message } from 'models/ticket/tests/mocks'
import { useAIAgentSendFeedback } from 'pages/tickets/detail/hooks/useAIAgentSendFeedback'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { RootState } from 'state/types'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'

import { messageFeedback } from '../../AIAgentFeedbackBar/tests/fixtures'
import { PREVIEW_HEIGHT } from '../../RuleSuggestion/SuggestionBody'
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

jest.mock('state/ui/ticketAIAgentFeedback', () => ({
    getSelectedAIMessage: jest.fn(),
}))

jest.mock('pages/tickets/detail/hooks/useAIAgentSendFeedback')
jest.mock('hooks/useMeasure')

const useAIAgentSendFeedbackMock = assumeMock(useAIAgentSendFeedback)
const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)
const getCurrentAccountIdMock = assumeMock(getCurrentAccountId)
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const logEventMock = assumeMock(logEvent)
const useMeasureMock = assumeMock(useMeasure)

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
        messages: [mockMessage],
        isTrial: false,
    }
    beforeEach(() => {
        getSelectedAIMessageMock.mockReturnValue(mockMessage)
        useAIAgentSendFeedbackMock.mockReturnValue({
            aiAgentSendFeedback: jest.fn(),
            aiAgentDeleteFeedback: jest.fn(),
        })
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
            ui: { editor: { isFocused: false } },
            ticket: fromJS({ _internal: { isPartialUpdating: false } }),
        })
        useMeasureMock.mockReturnValue([
            jest.fn(),
            {
                height: PREVIEW_HEIGHT + 1,
                width: 0,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                x: 0,
                y: 0,
            },
        ] as unknown as [jest.Mock, ReturnType<typeof useMeasure>[1]])
    })

    it('should get accountId from useAppSelector', () => {
        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...defaultProps} />
            </Provider>,
        )

        expect(getCurrentAccountIdMock).toHaveBeenCalled()
    })

    it('should log event to ai-agent-copied-to-editor segment with qa_failed banner when isTrial is false', () => {
        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...defaultProps} />
            </Provider>,
        )

        expect(screen.getByText('Copy to Editor')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Copy to Editor'))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentCopiedToEditor,
            {
                accountId: 1,
                banner: 'qa_failed',
            },
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
            </Provider>,
        )

        expect(screen.getByText('Copy to Editor')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Copy to Editor'))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentCopiedToEditor,
            {
                accountId: 1,
                banner: 'trial',
            },
        )
    })

    it('render empty message when feedbackMessage is not present', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        { ...messageFeedback, summary: undefined },
                        mockMessage,
                    ],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...defaultProps} />
            </Provider>,
        )

        expect(screen.queryByText('Copy to Editor')).toBeInTheDocument()
    })

    it('should display gorgias tips on preview state when isTrial is false', () => {
        const props = {
            ...defaultProps,
            isTrial: false,
        }

        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...props} />
            </Provider>,
        )

        expect(screen.getByText('Copy to Editor')).toBeInTheDocument()
        expect(screen.getByText('Expand')).toBeInTheDocument()
        expect(screen.queryByText('Review Response')).not.toBeInTheDocument()
    })

    it('should display gorgias tips on expand state when isTrial is true', () => {
        const props = {
            ...defaultProps,
            isTrial: true,
        }

        render(
            <Provider store={store}>
                <AIAgentDraftMessage {...props} />
            </Provider>,
        )

        expect(screen.getByText('Copy to Editor')).toBeInTheDocument()
        expect(screen.queryByText('Expand')).not.toBeInTheDocument()
        expect(screen.getByText('Review Response')).toBeInTheDocument()
    })
})
