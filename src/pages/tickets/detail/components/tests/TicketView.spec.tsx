import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {TicketViewContainer} from '../TicketView'

jest.mock('../TicketBodyVirtualized', () => () => (
    <div>TicketBodyVirtualized</div>
))
jest.mock('../TicketBodyNonVirtualized', () => () => (
    <div>TicketBodyNonVirtualized</div>
))
jest.mock('../TicketHeaderWrapper', () => () => <div>TicketHeaderWrapper</div>)
jest.mock('../ReplyForm', () => () => <div>ReplyForm</div>)

describe('<TicketView />', () => {
    const minProps = {
        agentsTyping: fromJS([]),
        agentsViewing: fromJS([]),
        currentUser: fromJS({}),
        customers: fromJS({}),
        customersIsLoading: jest.fn(),
        displayHistoryOnNextPage: jest.fn(),
        hasPhoneIntegration: false,
        hideTicket: jest.fn(),
        isHistoryDisplayed: false,
        isTicketHidden: false,
        setStatus: jest.fn(),
        submit: jest.fn(),
        ticket: fromJS({}),
        ticketBody: fromJS([]),
        toggleHistory: jest.fn(),
    } as unknown as ComponentProps<typeof TicketViewContainer>

    beforeAll(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketMessagesVirtualization]: true,
        }))
    })

    it('should not have the hidden classes', () => {
        const {container} = render(<TicketViewContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have the hidden classes', () => {
        const {container} = render(
            <TicketViewContainer {...minProps} isTicketHidden />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render non-virtualized TicketBody and associated components when LD flag is off', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketMessagesVirtualization]: false,
        }))

        const {container} = render(
            <TicketViewContainer {...minProps} ticket={fromJS({id: 123})} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
