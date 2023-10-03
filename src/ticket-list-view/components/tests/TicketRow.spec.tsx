import {render} from '@testing-library/react'
import React from 'react'

import {ticket} from 'fixtures/ticket'

import {TicketStatus} from 'business/types/ticket'
import TicketRow from '../TicketRow'

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))

describe('<TicketRow />', () => {
    const {
        channel,
        excerpt,
        last_message_datetime,
        messages_count,
        status,
        subject,
    } = ticket

    const props = {
        ticket: {
            channel,
            excerpt,
            status,
            subject,
        },

        lastMessageDatetime: last_message_datetime,
        messagesCount: messages_count,
    }

    it('should display a ticket basic information', () => {
        const {container} = render(<TicketRow {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the ticket as closed', () => {
        const {getByText} = render(
            <TicketRow
                {...props}
                ticket={{...props.ticket, status: TicketStatus.Closed}}
            />
        )

        expect(
            getByText('email').closest('div')?.classList.contains('isOpen')
        ).toBe(false)
    })

    it('should display the ticket without the counter of unread messages', () => {
        const {getByText, queryByText} = render(
            <TicketRow {...props} messagesCount={undefined} />
        )

        expect(
            getByText(ticket.subject).classList.contains('withCounter')
        ).toBe(false)

        expect(queryByText(ticket.messages_count)).not.toBeInTheDocument()
    })
})
