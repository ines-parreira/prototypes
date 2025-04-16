import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    IntentCard,
    IntentCardProps,
} from 'pages/stats/common/components/IntentCard'
import TrendBadge from 'pages/stats/common/components/TrendBadge/TrendBadge'

jest.mock('pages/stats/common/components/TrendBadge/TrendBadge', () => ({
    __esModule: true,
    default: jest
        .fn()
        .mockImplementation((props) => (
            <div data-testid="trend-badge" {...props} />
        )),
}))

describe('IntentCard', () => {
    const onViewTickets = jest.fn()

    const defaultProps: IntentCardProps = {
        title: 'Return',
        description:
            'Connection stability issues are causing a lot of frustration for return',
        ticketCount: 220,
        prevTicketCount: 165,
        totalTicketCount: 8_857,
        onViewTickets,
    }

    it('renders the card content correctly', () => {
        render(<IntentCard {...defaultProps} />)

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
        expect(screen.getByText('220/8,857 tickets')).toBeInTheDocument()
    })

    it('passes correct props to TrendBadge', () => {
        render(<IntentCard {...defaultProps} />)

        expect(TrendBadge).toHaveBeenCalledWith(
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
})
