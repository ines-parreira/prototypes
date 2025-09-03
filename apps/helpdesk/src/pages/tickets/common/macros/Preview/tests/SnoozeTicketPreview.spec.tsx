import { render, screen } from '@testing-library/react'

import { snoozeTicketAction } from 'fixtures/macro'

import { SnoozeTicketPreview } from '../SnoozeTicketPreview'

describe('<SnoozeTicketPreview />', () => {
    it('should render snooze ticket preview', () => {
        render(<SnoozeTicketPreview snoozeTicketAction={snoozeTicketAction} />)

        expect(screen.getByText('Snooze for')).toBeInTheDocument()
        expect(screen.getByText('1 day(s)')).toBeInTheDocument()
    })

    it('should return null when no snooze action is provided', () => {
        const { container } = render(
            <SnoozeTicketPreview snoozeTicketAction={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle different snooze durations', () => {
        const customSnoozeAction = {
            ...snoozeTicketAction,
            arguments: { snooze_timedelta: '2d' },
        }

        render(<SnoozeTicketPreview snoozeTicketAction={customSnoozeAction} />)

        expect(screen.getByText('Snooze for')).toBeInTheDocument()
        expect(screen.getByText('2 day(s)')).toBeInTheDocument()
    })
})
