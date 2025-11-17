import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { Skeleton } from '@gorgias/axiom'

import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import type { IntentCardProps } from 'domains/reporting/pages/common/components/IntentCard'
import { IntentCard } from 'domains/reporting/pages/common/components/IntentCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge/TrendBadge'

jest.mock('domains/reporting/pages/common/components/TrendBadge/TrendBadge')
const TrendBadgeMock = assumeMock(TrendBadge)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: jest.fn().mockImplementation((props) => <div {...props} />),
}))

describe('IntentCard', () => {
    const onViewTickets = jest.fn()

    const L1 = 'Return'
    const L2 = 'Request'
    const L3 =
        'Connection stability issues are causing a lot of frustration for return'

    const defaultProps = {
        intent: [L1, L2, L3].join(TICKET_CUSTOM_FIELDS_API_SEPARATOR),
        ticketCount: 220,
        prevTicketCount: 165,
        totalTicketCount: 8_857,
        onViewTickets,
    } satisfies IntentCardProps

    beforeEach(() => {
        TrendBadgeMock.mockImplementation(() => <div />)
    })

    it('renders the card content correctly', () => {
        render(<IntentCard {...defaultProps} />)

        expect(screen.getByText(L1)).toBeInTheDocument()
        expect(screen.getByText(L2)).toBeInTheDocument()
        expect(screen.getByText(L3)).toBeInTheDocument()
        expect(screen.getByText('220/8,857 tickets')).toBeInTheDocument()
    })

    it('passes correct props to TrendBadge', () => {
        render(<IntentCard {...defaultProps} />)

        expect(TrendBadgeMock).toHaveBeenCalledWith(
            expect.objectContaining({
                value: defaultProps.ticketCount,
                prevValue: defaultProps.prevTicketCount,
                interpretAs: 'less-is-better',
            }),
            expect.any(Object),
        )
    })

    it('calls onViewTickets when the button is clicked', () => {
        render(<IntentCard {...defaultProps} />)

        userEvent.click(screen.getByRole('button'))

        expect(defaultProps.onViewTickets).toHaveBeenCalled()
    })

    it('renders loading skeleton when isLoading is true', () => {
        render(<IntentCard isLoading />)

        expect(screen.queryByText(L1)).not.toBeInTheDocument()
        expect(screen.queryByText(L2)).not.toBeInTheDocument()
        expect(screen.queryByText(L3)).not.toBeInTheDocument()
        expect(screen.queryByText('220/8,857 tickets')).not.toBeInTheDocument()

        expect(Skeleton).toHaveBeenCalledTimes(4)
    })
})
