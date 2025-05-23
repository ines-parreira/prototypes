import { render, screen } from '@testing-library/react'

import type { Ticket } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { assumeMock } from 'utils/testing'

import { TicketSummary } from '../TicketSummary'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/tickets/detail/components/TicketSummary', () => () => (
    <div>TicketSummarySection</div>
))

describe('TicketSummary', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should not render the ticket summary is the feature flag is disabled', () => {
        const ticket = { id: 1, summary: 'yep' } as unknown as Ticket
        render(<TicketSummary ticket={ticket} />)
        expect(
            screen.queryByText('TicketSummarySection'),
        ).not.toBeInTheDocument()
    })

    it('should render the ticket summary is the feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        const ticket = { id: 1, summary: 'yep' } as unknown as Ticket
        render(<TicketSummary ticket={ticket} />)
        expect(screen.getByText('TicketSummarySection')).toBeInTheDocument()
    })
})
