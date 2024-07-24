import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {useFlag} from 'common/flags'

import useIsTicketViewed from '../../hooks/useIsTicketViewed'
import {TicketSummary} from '../../types'
import Ticket from '../Ticket'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('../../hooks/useIsTicketViewed', () => jest.fn())
const useIsTicketViewedMock = useIsTicketViewed as jest.Mock

describe('Ticket', () => {
    const defaultTicket = {
        channel: 'email',
        customer: {
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
        const {getByText} = render(<Ticket {...defaultProps} />)
        expect(getByText('John Doe')).toBeInTheDocument()
        expect(getByText('email')).toBeInTheDocument()
        expect(getByText('Subject')).toBeInTheDocument()
        expect(getByText('Excerpt')).toBeInTheDocument()
    })

    it('should select a ticket when the checkbox is clicked', () => {
        useFlagMock.mockReturnValue(true)
        const onSelect = jest.fn()
        const {getByRole} = render(
            <Ticket {...defaultProps} onSelect={onSelect} />
        )
        userEvent.click(getByRole('checkbox'))

        expect(onSelect).toHaveBeenCalledWith(1, true, false)
    })
})
