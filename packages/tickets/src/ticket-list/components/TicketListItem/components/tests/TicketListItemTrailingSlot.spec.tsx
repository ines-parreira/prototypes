import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { TicketListItemTrailingSlot } from '../TicketListItemTrailingSlot'

vi.mock('@repo/utils', async (importOriginal) => ({
    ...(await importOriginal()),
    shortenRelativeDurationLabel: vi.fn(() => '2h'),
}))

describe('TicketListItemTrailingSlot', () => {
    describe('status', () => {
        it('renders no status label for open status', () => {
            render(<TicketListItemTrailingSlot status="open" datetime={null} />)
            expect(screen.queryByText('Open')).not.toBeInTheDocument()
        })

        it('shows "Closed" tooltip label for closed status', async () => {
            const { user } = render(
                <TicketListItemTrailingSlot status="closed" datetime={null} />,
            )

            await user.tab()

            expect(await screen.findByText('Closed')).toBeInTheDocument()
        })

        it('shows "Snoozed" tooltip label for snoozed status', async () => {
            const { user } = render(
                <TicketListItemTrailingSlot status="snoozed" datetime={null} />,
            )

            await user.tab()

            expect(await screen.findByText('Snoozed')).toBeInTheDocument()
        })

        it('renders no status label when status is not provided', () => {
            render(<TicketListItemTrailingSlot datetime={null} />)
            expect(screen.queryByText('Open')).not.toBeInTheDocument()
            expect(screen.queryByText('Closed')).not.toBeInTheDocument()
            expect(screen.queryByText('Snoozed')).not.toBeInTheDocument()
        })
    })

    describe('priority', () => {
        it('shows "High priority" tooltip label for high priority', async () => {
            const { user } = render(
                <TicketListItemTrailingSlot priority="high" datetime={null} />,
            )

            await user.tab()

            expect(await screen.findByText('High priority')).toBeInTheDocument()
        })

        it('shows "Critical priority" tooltip label for critical priority', async () => {
            const { user } = render(
                <TicketListItemTrailingSlot
                    priority="critical"
                    datetime={null}
                />,
            )

            await user.tab()

            expect(
                await screen.findByText('Critical priority'),
            ).toBeInTheDocument()
        })

        it('renders no priority label when priority is not provided', () => {
            render(<TicketListItemTrailingSlot datetime={null} />)
            expect(screen.queryByText('High priority')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Critical priority'),
            ).not.toBeInTheDocument()
        })
    })

    describe('datetime', () => {
        it('renders relative time when datetime is provided', () => {
            render(
                <TicketListItemTrailingSlot datetime="2024-01-01T00:00:00.000Z" />,
            )
            expect(screen.getByText('2h')).toBeInTheDocument()
        })

        it('renders no time when datetime is null', () => {
            render(<TicketListItemTrailingSlot datetime={null} />)
            expect(screen.queryByText('2h')).not.toBeInTheDocument()
        })
    })
})
