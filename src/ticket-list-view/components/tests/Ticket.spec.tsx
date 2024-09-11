import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {useFlag} from 'common/flags'
import {Customer} from 'models/customer/types'
import useIsTicketViewed from 'ticket-list-view/hooks/useIsTicketViewed'
import {TicketSummary} from 'ticket-list-view/types'

import Ticket from '../Ticket'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('../../hooks/useIsTicketViewed', () => jest.fn())
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
        const {getByText} = render(<Ticket {...defaultProps} />)
        expect(getByText('email')).toBeInTheDocument()
        expect(getByText('Subject')).toBeInTheDocument()
        expect(getByText('Excerpt')).toBeInTheDocument()
    })

    it('should render the new ticket design', () => {
        useFlagMock.mockReturnValue(true)
        render(<Ticket {...defaultProps} />)
        expect(
            screen.getByText(defaultProps.ticket.customer!.name)
        ).toBeInTheDocument()
        expect(screen.getByText('email')).toBeInTheDocument()
        expect(
            screen.getByText(defaultProps.ticket.subject)
        ).toBeInTheDocument()
        expect(
            screen.getByText(defaultProps.ticket.excerpt!)
        ).toBeInTheDocument()
    })

    it('should render customer email', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: {...defaultTicket.customer, name: ''} as Customer,
                }}
            />
        )
        expect(
            screen.getByText(defaultProps.ticket.customer!.email!)
        ).toBeInTheDocument()
    })

    it('should render customer id', () => {
        useFlagMock.mockReturnValue(true)
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
            />
        )
        expect(
            screen.getByText(`Customer #${defaultProps.ticket.customer!.id}`)
        ).toBeInTheDocument()
    })

    it('should handle unavailable informations on customer', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: null,
                }}
            />
        )
        expect(
            document.getElementsByClassName('customer')[0]
        ).toHaveTextContent('')
    })

    it('should select a ticket when the checkbox is clicked', () => {
        useFlagMock.mockReturnValue(true)
        const onSelect = jest.fn()
        render(<Ticket {...defaultProps} onSelect={onSelect} />)
        userEvent.click(screen.getByRole('checkbox'))

        expect(onSelect).toHaveBeenCalledWith(1, true, false)
    })
})
