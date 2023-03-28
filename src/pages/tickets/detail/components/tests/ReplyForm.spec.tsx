import React, {RefObject} from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {editorFocused} from 'state/ui/editor/actions'

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
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('state/ui/editor/actions')

const mockStore = configureMockStore([thunk])

describe('<ReplyForm />', () => {
    let formRef: jest.Mock
    let onSubmit: jest.Mock
    let setTicketStatus: jest.Mock

    let defaultProps: {
        formRef: RefObject<HTMLFormElement>
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
        onSubmit = jest.fn()
        setTicketStatus = jest.fn()

        defaultProps = {
            formRef: formRef as unknown as RefObject<HTMLFormElement>,
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

    it('should send events when focused', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ReplyForm {...defaultProps} />
            </Provider>
        )
        screen.getByRole('button').focus()
        expect(editorFocused).toHaveBeenCalledTimes(1)
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
