import {render} from '@testing-library/react'
import _noop from 'lodash/noop'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {INCOMING_PHONE_CALL} from 'constants/event'
import {message as defaultMessage} from 'models/ticket/tests/mocks'
import {TicketElement} from 'models/ticket/types'
import {FACEBOOK_PRIVATE_REPLY_ACTION} from 'pages/tickets/detail/components/PrivateReplyEvent/constants'
import TicketBodyElement from 'pages/tickets/detail/components/TicketBodyElement'
import {RootState} from 'state/types'
import {reportError} from 'utils/errors'

jest.mock('utils/errors')

jest.mock('pages/tickets/detail/components/AuditLogEvent', () => ({
    __esModule: true,
    default: () => <p>AuditLogEvent</p>,
    contentfulEventTypesValues: ['TicketMessageCreated'],
}))

jest.mock('pages/tickets/detail/components/Event', () => () => <p>Event</p>)

jest.mock('pages/tickets/detail/components/PhoneEvent/PhoneEvent', () => () => (
    <p>PhoneEvent</p>
))

jest.mock(
    'pages/tickets/detail/components/PrivateReplyEvent/PrivateReplyEvent',
    () => () => <p>PrivateReplyEvent</p>
)

jest.mock(
    'pages/tickets/detail/components/RuleSuggestion/AISuggestion',
    () => () => <p>AISuggestion</p>
)

jest.mock(
    'pages/tickets/detail/components/RuleSuggestion/RuleSuggestion',
    () => () => <p>RuleSuggestion</p>
)

jest.mock('pages/tickets/detail/components/SatisfactionSurvey', () => () => (
    <p>SatisfactionSurvey</p>
))

jest.mock(
    'pages/tickets/detail/components/TicketMessages/TicketMessages',
    () => () => <p>TicketMessages</p>
)

const mockStore = configureMockStore([thunk])

const defaultState: Partial<RootState> = {}

describe('TicketBodyElement', () => {
    const defaultProps = {
        hasCursor: false,
        highlightedElements: null,
        index: 0,
        isLast: false,
        lastMessageDatetimeAfterMount: null,
        setHighlightedElements: _noop,
    }

    beforeEach(() => {
        ;(reportError as jest.Mock).mockImplementation(_noop)
    })

    it('should display messages', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={[{...defaultMessage}]}
                />
            </Provider>
        )

        expect(getByText('TicketMessages')).toBeInTheDocument()
    })

    it('should display a satisfaction survey', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={
                        {isSatisfactionSurvey: true} as unknown as TicketElement
                    }
                />
            </Provider>
        )

        expect(getByText('SatisfactionSurvey')).toBeInTheDocument()
    })

    it('should display a rule suggestion', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={
                        {isRuleSuggestion: true} as unknown as TicketElement
                    }
                />
            </Provider>
        )

        expect(getByText('RuleSuggestion')).toBeInTheDocument()
    })

    it('should display an AI suggestion', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={{isAISuggestion: true} as unknown as TicketElement}
                />
            </Provider>
        )

        expect(getByText('AISuggestion')).toBeInTheDocument()
    })

    it('should alert Sentry if given element is not a valid ticket element', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={{foo: 'bar'} as unknown as TicketElement}
                />
            </Provider>
        )

        expect(reportError).toHaveBeenCalledWith(
            new Error('Null ticket element'),
            {extra: {element: {foo: 'bar'}}}
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should display an audit log event', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={
                        {
                            isEvent: true,
                            type: 'TicketMessageCreated',
                        } as unknown as TicketElement
                    }
                />
            </Provider>
        )

        expect(getByText('AuditLogEvent')).toBeInTheDocument()
    })

    it('should display a phone event', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={
                        {
                            isEvent: true,
                            type: INCOMING_PHONE_CALL,
                        } as unknown as TicketElement
                    }
                />
            </Provider>
        )

        expect(getByText('PhoneEvent')).toBeInTheDocument()
    })

    it('should display a private reply event', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={
                        {
                            isEvent: true,
                            data: {action_name: FACEBOOK_PRIVATE_REPLY_ACTION},
                        } as unknown as TicketElement
                    }
                />
            </Provider>
        )

        expect(getByText('PrivateReplyEvent')).toBeInTheDocument()
    })

    it('should display a generic event', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketBodyElement
                    {...defaultProps}
                    element={{isEvent: true} as TicketElement}
                />
            </Provider>
        )

        expect(getByText('Event')).toBeInTheDocument()
    })
})
