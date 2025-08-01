import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import type { TicketSummary as TicketSummaryType } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'

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

    const props = { ticketId: 1, summary: {} as TicketSummaryType }

    it('should not render the ticket summary is the feature flag is disabled', () => {
        render(<TicketSummary {...props} />)

        expect(
            screen.queryByText('TicketSummarySection'),
        ).not.toBeInTheDocument()
    })

    it('should render the ticket summary is the feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        render(<TicketSummary {...props} />)

        expect(screen.getByText('TicketSummarySection')).toBeInTheDocument()
    })
})
