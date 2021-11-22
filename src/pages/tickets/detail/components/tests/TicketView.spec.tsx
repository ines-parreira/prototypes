import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {SubmitArgs} from '../../TicketDetailContainer'
import {TicketViewContainer} from '../TicketView'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../../../business/types/ticket'

jest.mock('../TicketHeader', () => () => <div>TicketHeader</div>)
jest.mock('../TicketBody', () => () => <div>TicketBody</div>)
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
        ({submit}: {submit: (props: SubmitArgs) => void}) =>
            (
                <button
                    type="submit"
                    data-testid="TicketSubmitButtons"
                    onClick={() => submit({status: 'closed', next: true})}
                >
                    TicketSubmitButtons
                </button>
            )
)

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

    describe('phone submit buttons', () => {
        it('should render on existing ticket page', () => {
            const {container} = render(
                <TicketViewContainer
                    {...minProps}
                    hasPhoneIntegration
                    sourceType={TicketMessageSourceType.Phone}
                    ticket={fromJS({
                        id: 123,
                        customer: {channels: [{type: TicketChannel.Phone}]},
                    })}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render on new ticket page', () => {
            const {container} = render(
                <TicketViewContainer
                    {...minProps}
                    hasPhoneIntegration
                    sourceType={TicketMessageSourceType.Phone}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should call submit callback when submitting message', () => {
        const {getByTestId} = render(<TicketViewContainer {...minProps} />)

        userEvent.click(getByTestId('TicketSubmitButtons'))
        expect(minProps.submit).toHaveBeenCalledWith({
            action: undefined,
            next: true,
            resetMessage: undefined,
            status: 'closed',
        })
    })
})
