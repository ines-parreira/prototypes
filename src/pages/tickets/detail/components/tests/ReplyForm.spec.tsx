import React, {RefObject} from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import {IntegrationType} from 'models/integration/constants'

jest.mock('../ReplyArea/ReplyMessageChannel', () => () => (
    <div>ReplyMessageChannel</div>
))
jest.mock('../ReplyArea/TicketReplyArea', () => () => (
    <div>TicketReplyArea</div>
))
jest.mock('../ReplyArea/PhoneTicketSubmitButtons', () => () => (
    <div>PhoneTicketSubmitButtons</div>
))
jest.mock(
    '../ReplyArea/TicketSubmitButtons',
    () =>
        ({
            setTicketStatus,
        }: {
            setTicketStatus: (status: TicketStatus) => void
        }) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const {TicketStatus} = require('business/types/ticket')
            return (
                <button
                    type="submit"
                    data-testid="TicketSubmitButtons"
                    onClick={() =>
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        setTicketStatus(TicketStatus.Closed)
                    }
                >
                    TicketSubmitButtons
                </button>
            )
        }
)

const mockStore = configureMockStore([thunk])

describe('<ReplyForm />', () => {
    let formRef: jest.Mock
    let onBlur: jest.Mock
    let onFocus: jest.Mock
    let onSubmit: jest.Mock
    let setTicketStatus: jest.Mock

    let defaultProps: {
        formRef: RefObject<HTMLFormElement>
        onBlur: jest.Mock
        onFocus: jest.Mock
        onSubmit: jest.Mock
        setTicketStatus: jest.Mock
    }

    const defaultState = {
        currentUser: fromJS({}),
        ticket: fromJS({}),
    }

    const phoneRelatedStore = {
        integrations: fromJS({
            integrations: [{id: 1, type: IntegrationType.Phone}],
        }),
        newMessage: fromJS({
            newMessage: {
                source: {type: TicketMessageSourceType.Phone},
            },
        }),
    }

    beforeEach(() => {
        formRef = jest.fn()
        onBlur = jest.fn()
        onFocus = jest.fn()
        onSubmit = jest.fn()
        setTicketStatus = jest.fn()

        defaultProps = {
            formRef: formRef as unknown as RefObject<HTMLFormElement>,
            onBlur,
            onFocus,
            onSubmit,
            setTicketStatus,
        }
    })

    it('should set the given ref to the form element', () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    id: 123,
                })}
            >
                <ReplyForm {...defaultProps} />
            </Provider>
        )

        expect(formRef).toHaveBeenCalledWith(expect.any(HTMLFormElement))
    })

    describe('ticket reply area and submit buttons', () => {
        it('should render on existing ticket page', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        id: 123,
                    })}
                >
                    <ReplyForm {...defaultProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render on new ticket page', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <ReplyForm {...defaultProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should call onFocus/onBlur when focus changes', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ReplyForm {...defaultProps} />
            </Provider>
        )
        const button = screen.getByRole('button')
        button.focus()
        expect(onFocus).toHaveBeenCalledTimes(1)

        button.blur()
        expect(onBlur).toHaveBeenCalledTimes(1)
    })

    describe('phone submit buttons', () => {
        it('should render on existing ticket page', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        id: 123,
                        customer: {channels: [{type: TicketChannel.Phone}]},
                        ...phoneRelatedStore,
                    })}
                >
                    <ReplyForm {...defaultProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render on new ticket page', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        ...phoneRelatedStore,
                    })}
                >
                    <ReplyForm {...defaultProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
