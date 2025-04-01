import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useFlag } from 'core/flags'
import { Customer } from 'models/customer/types'
import useIsTicketViewed from 'ticket-list-view/hooks/useIsTicketViewed'
import { TicketSummary } from 'ticket-list-view/types'
import { assumeMock } from 'utils/testing'

import Ticket from '../Ticket'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('ticket-list-view/hooks/useIsTicketViewed', () => jest.fn())
const useIsTicketViewedMock = useIsTicketViewed as jest.Mock

describe('Ticket', () => {
    const defaultTicket = {
        channel: 'email',
        customer: {
            id: 888,
            email: 'john.doe@gorgias.com',
            name: 'John Doe',
        },
        excerpt: 'Excerpt',
        id: 1,
        is_unread: false,
        last_message_datetime: '',
        subject: 'Subject',
        updated_datetime: '',
    } as TicketSummary

    const defaultProps = {
        isActive: false,
        ticket: defaultTicket,
        viewId: 1,
        onSelect: jest.fn(),
    }

    beforeEach(() => {
        defaultProps.onSelect = jest.fn()

        useFlagMock.mockReturnValue(false)
        useIsTicketViewedMock.mockReturnValue({
            agentViewingMessage: '',
            isTicketViewed: false,
        })
    })

    it('should render a default ticket', () => {
        render(<Ticket {...defaultProps} />)
        expect(
            screen.getByText(defaultProps.ticket.customer!.name),
        ).toBeInTheDocument()
        expect(screen.getByText('email')).toBeInTheDocument()
        expect(
            screen.getByText(defaultProps.ticket.subject),
        ).toBeInTheDocument()
        expect(
            screen.getByText(defaultProps.ticket.excerpt!),
        ).toBeInTheDocument()
    })

    it('should link to a split ticket view url', () => {
        render(<Ticket {...defaultProps} />)
        const el = screen.getByText(defaultProps.ticket.subject).closest('a')
        expect(el).toHaveAttribute('to', '/app/views/1/1')
    })

    it('should link to a ticket view url if the flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        render(<Ticket {...defaultProps} />)
        const el = screen.getByText(defaultProps.ticket.subject).closest('a')
        expect(el).toHaveAttribute('to', '/app/tickets/1/1')
    })

    it('should render customer email', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: {
                        ...defaultTicket.customer,
                        name: '',
                    } as Customer,
                }}
            />,
        )
        expect(
            screen.getByText(defaultProps.ticket.customer!.email!),
        ).toBeInTheDocument()
    })

    it('should render customer id', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: {
                        ...defaultTicket.customer,
                        name: '',
                        email: '',
                    } as Customer,
                }}
            />,
        )
        expect(
            screen.getByText(`Customer #${defaultProps.ticket.customer!.id}`),
        ).toBeInTheDocument()
    })

    it('should handle unavailable informations on customer', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: null,
                }}
            />,
        )
        expect(
            document.getElementsByClassName('customer')[0],
        ).toHaveTextContent('')
    })

    it('should select a ticket when the checkbox is clicked', () => {
        const onSelect = jest.fn()
        render(<Ticket {...defaultProps} onSelect={onSelect} />)
        userEvent.click(screen.getByRole('checkbox'))

        expect(onSelect).toHaveBeenCalledWith(1, true, false)
    })
})
