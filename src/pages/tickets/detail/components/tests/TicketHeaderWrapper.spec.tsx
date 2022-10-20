import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'

import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock('pages/tickets/detail/components/HistoryButton', () => () => (
    <div>HistoryButton</div>
))
jest.mock('pages/tickets/detail/components/TicketHeader', () => () => (
    <div>TicketHeader</div>
))

const mockStore = configureMockStore([thunk])

describe('<TicketHeaderWrapper/>', () => {
    beforeAll(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketMessagesVirtualization]: true,
        }))
    })

    const minProps: ComponentProps<typeof TicketHeaderWrapper> = {
        hideTicket: jest.fn(),
        handleHistoryToggle: jest.fn(),
    }
    const defaultState = {
        currentUser: fromJS({}),
        ticket: fromJS({
            id: 123,
        }),
    }

    it('should render history button, ticket header and separator', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketHeaderWrapper {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide history button when on a new ticket and not render separator', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    ticket: fromJS({}),
                })}
            >
                <TicketHeaderWrapper {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
