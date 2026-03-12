import { screen } from '@testing-library/react'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { TicketListItemTrailingSlot } from '../TicketListItemTrailingSlot'

vi.mock('@gorgias/axiom', async (importOriginal) => ({
    ...(await importOriginal()),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

vi.mock('@repo/utils', async (importOriginal) => ({
    ...(await importOriginal()),
    shortenRelativeDurationLabel: vi.fn(() => '2h'),
}))

beforeEach(() => {
    testAppQueryClient.clear()
})

describe('TicketListItemTrailingSlot', () => {
    describe('status', () => {
        it('shows "Open" tooltip label for open status', () => {
            render(<TicketListItemTrailingSlot status="open" datetime={null} />)
            expect(screen.getByText('Open')).toBeInTheDocument()
        })

        it('shows "Closed" tooltip label for closed status', () => {
            render(
                <TicketListItemTrailingSlot status="closed" datetime={null} />,
            )
            expect(screen.getByText('Closed')).toBeInTheDocument()
        })

        it('shows "Snoozed" tooltip label for snoozed status', () => {
            render(
                <TicketListItemTrailingSlot status="snoozed" datetime={null} />,
            )
            expect(screen.getByText('Snoozed')).toBeInTheDocument()
        })

        it('renders no status label when status is not provided', () => {
            render(<TicketListItemTrailingSlot datetime={null} />)
            expect(screen.queryByText('Open')).not.toBeInTheDocument()
            expect(screen.queryByText('Closed')).not.toBeInTheDocument()
            expect(screen.queryByText('Snoozed')).not.toBeInTheDocument()
        })
    })

    describe('priority', () => {
        it('shows "High priority" tooltip label for high priority', () => {
            render(
                <TicketListItemTrailingSlot priority="high" datetime={null} />,
            )
            expect(screen.getByText('High priority')).toBeInTheDocument()
        })

        it('shows "Critical priority" tooltip label for critical priority', () => {
            render(
                <TicketListItemTrailingSlot
                    priority="critical"
                    datetime={null}
                />,
            )
            expect(screen.getByText('Critical priority')).toBeInTheDocument()
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
