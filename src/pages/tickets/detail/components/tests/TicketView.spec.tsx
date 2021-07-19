import React, {ComponentProps} from 'react'
import {fromJS, List, Map} from 'immutable'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {TicketViewContainer} from '../TicketView'

jest.mock('../TicketHeader', () => () => <div>TicketHeader</div>)
jest.mock('../ReplyArea/ReplyMessageChannel.js', () => () => (
    <div>ReplyMessageChannel</div>
))
jest.mock('../ReplyArea/TicketReplyArea.js', () => () => (
    <div>TicketReplyArea</div>
))
jest.mock(
    '../ReplyArea/TicketSubmitButtons.js',
    () => ({
        submit,
    }: {
        submit: (
            status?: string | null,
            next?: any,
            action?: List<Map<any, any>> | null,
            resetMessage?: boolean
        ) => void
    }) => (
        <button
            type="submit"
            data-testid="TicketSubmitButtons"
            onClick={() => submit('closed', true)}
        >
            TicketSubmitButtons
        </button>
    )
)

describe('<TicketView />', () => {
    const minProps = ({
        agentsTyping: fromJS([]),
        agentsViewing: fromJS([]),
        currentUser: fromJS({}),
        customers: fromJS({}),
        customersIsLoading: jest.fn(),
        displayHistoryOnNextPage: jest.fn(),
        hideTicket: jest.fn(),
        isHistoryDisplayed: false,
        isTicketHidden: false,
        setStatus: jest.fn(),
        submit: jest.fn(),
        ticket: fromJS({}),
        ticketBody: fromJS([]),
        toggleHistory: jest.fn(),
    } as unknown) as ComponentProps<typeof TicketViewContainer>

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

    it('should call submit callback when submitting message', () => {
        const {getByTestId} = render(<TicketViewContainer {...minProps} />)

        userEvent.click(getByTestId('TicketSubmitButtons'))
        expect(minProps.submit).toHaveBeenCalledWith(
            'closed',
            true,
            undefined,
            undefined
        )
    })
})
