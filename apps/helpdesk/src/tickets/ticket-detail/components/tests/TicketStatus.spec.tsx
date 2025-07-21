import { render, screen } from '@testing-library/react'

import {
    TicketCompact,
    TicketStatus as TicketStatusType,
} from '@gorgias/helpdesk-types'

import { TicketStatus } from '../TicketStatus'

const mockTicket = {
    id: 1,
    status: TicketStatusType.Open,
} as TicketCompact

describe('TicketStatus', () => {
    it('should render open status', () => {
        render(<TicketStatus ticket={mockTicket} />)

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('should render snoozed status when snooze_datetime is set', () => {
        render(
            <TicketStatus
                ticket={{
                    ...mockTicket,
                    snooze_datetime: '2023-01-01',
                }}
            />,
        )

        expect(screen.getByText('snoozed')).toBeInTheDocument()
    })
})
