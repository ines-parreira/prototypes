import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import LD from 'launchdarkly-react-client-sdk'

import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import {IntegrationType} from 'models/integration/constants'
import {FeatureFlagKey} from 'config/featureFlags'

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
        ({submit}: {submit: (props: SubmitArgs) => void}) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const {TicketStatus} = require('business/types/ticket')
            return (
                <button
                    type="submit"
                    data-testid="TicketSubmitButtons"
                    onClick={() =>
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        submit({status: TicketStatus.Closed, next: true})
                    }
                >
                    TicketSubmitButtons
                </button>
            )
        }
)

const mockStore = configureMockStore([thunk])

describe('<ReplyForm />', () => {
    beforeAll(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketMessagesVirtualization]: true,
        }))
    })

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

    const mockSubmit = jest.fn()

    describe('ticket reply area and submit buttons', () => {
        it('should render on existing ticket page', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        id: 123,
                    })}
                >
                    <ReplyForm submit={mockSubmit} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render on new ticket page', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <ReplyForm submit={mockSubmit} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
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
                    <ReplyForm submit={mockSubmit} />
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
                    <ReplyForm submit={mockSubmit} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should call submit callback when submitting message', () => {
        const {getByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <ReplyForm submit={mockSubmit} />
            </Provider>
        )

        userEvent.click(getByTestId('TicketSubmitButtons'))
        expect(mockSubmit).toHaveBeenCalledWith({
            action: undefined,
            next: true,
            resetMessage: undefined,
            status: 'closed',
        })
    })
})
