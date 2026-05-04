import { render } from '@repo/testing/vitest'
import { fireEvent, screen } from '@testing-library/react'

import type {
    SearchCallRow,
    SearchCustomerRow,
    SearchTicketRow,
} from '../../types'
import { SearchSpotlightSection } from '../SearchSpotlightSection'

const customerRow: SearchCustomerRow = {
    kind: 'customer',
    id: 101,
    raw: { id: 101 },
    url: '/app/customers/101',
    name: { text: 'Ada Lovelace' },
    email: { text: 'ada@example.com' },
    phone: { text: '+33 1 23 45 67 89' },
}

const ticketRow: SearchTicketRow = {
    kind: 'ticket',
    id: 202,
    raw: { id: 202 },
    url: '/app/ticket/202',
    subject: { text: 'Refund request' },
    hiddenMatch: { text: 'Matched message excerpt' },
    customerName: { text: 'Ada Lovelace' },
    statusLabel: 'Open',
    statusColor: 'purple',
    isUnread: true,
    activityLabel: '4 d ago by',
    agentName: 'Grace Hopper',
    agentAvatarUrl: 'https://example.com/avatar.png',
}

const callRow: SearchCallRow = {
    kind: 'call',
    id: 303,
    raw: { id: 303 },
    url: '/app/voice-call/303',
    title: { text: 'Callback request' },
    customerPhone: { text: '+33 1 23 45 67 89' },
    statusLabel: 'Answered',
    statusColor: 'green',
    callIcon: 'comm-phone-incoming',
    activityLabel: '2 h ago',
}

describe('SearchSpotlightSection', () => {
    it('renders customer, ticket, and call rows', () => {
        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={vi.fn()}
                onSelectSection={vi.fn()}
                selectedSection="all"
                sections={[
                    {
                        id: 'customers',
                        title: 'Recently accessed customers',
                        recentTitle: 'Recently accessed customers',
                        rows: [{ row: customerRow, globalIndex: 0 }],
                        totalCount: 1,
                        emptyMessage: 'No customers',
                    },
                    {
                        id: 'tickets',
                        title: 'Recently accessed tickets',
                        recentTitle: 'Recently accessed tickets',
                        rows: [{ row: ticketRow, globalIndex: 1 }],
                        totalCount: 1,
                        emptyMessage: 'No tickets',
                    },
                    {
                        id: 'calls',
                        title: 'Recently accessed calls',
                        recentTitle: 'Recently accessed calls',
                        rows: [{ row: callRow, globalIndex: 2 }],
                        totalCount: 1,
                        emptyMessage: 'No calls',
                    },
                ]}
                selectedIndex={1}
                setRowRef={vi.fn()}
                setSelectedIndex={vi.fn()}
            />,
        )

        expect(screen.getAllByText('Ada Lovelace')).toHaveLength(2)
        expect(screen.getByText('ada@example.com')).toBeInTheDocument()
        expect(screen.getByText('Refund request')).toBeInTheDocument()
        expect(screen.getByText('Matched message excerpt')).toBeInTheDocument()
        expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
        expect(screen.getByText('Callback request')).toBeInTheDocument()
        expect(screen.getByText('Answered')).toBeInTheDocument()
    })

    it('shows more results in all-search mode and switches sections on click', async () => {
        const onSelectSection = vi.fn()
        const { user } = render(
            <SearchSpotlightSection
                isSearchMode={true}
                onOpenRow={vi.fn()}
                onSelectSection={onSelectSection}
                selectedSection="all"
                sections={[
                    {
                        id: 'customers',
                        title: 'Customers',
                        recentTitle: 'Recently accessed customers',
                        rows: [{ row: customerRow, globalIndex: 0 }],
                        totalCount: 5,
                        emptyMessage: 'No customers',
                    },
                ]}
                selectedIndex={0}
                setRowRef={vi.fn()}
                setSelectedIndex={vi.fn()}
            />,
        )

        await user.click(screen.getByRole('link', { name: /more results/i }))

        expect(screen.getByText('4')).toBeInTheDocument()
        expect(onSelectSection).toHaveBeenCalledWith('customers')
    })

    it('renders empty states and opens a hidden-match row on click', () => {
        const onOpenRow = vi.fn().mockResolvedValue(undefined)
        const setSelectedIndex = vi.fn()

        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={onOpenRow}
                onSelectSection={vi.fn()}
                selectedSection="all"
                sections={[
                    {
                        id: 'tickets',
                        title: 'Tickets',
                        recentTitle: 'Recently accessed tickets',
                        rows: [{ row: ticketRow, globalIndex: 1 }],
                        totalCount: 1,
                        emptyMessage: 'No tickets',
                    },
                    {
                        id: 'calls',
                        title: 'Calls',
                        recentTitle: 'Recently accessed calls',
                        rows: [],
                        totalCount: 0,
                        emptyMessage: 'No calls',
                    },
                ]}
                selectedIndex={1}
                setRowRef={vi.fn()}
                setSelectedIndex={setSelectedIndex}
            />,
        )

        fireEvent.mouseEnter(screen.getByText('Matched message excerpt'))
        fireEvent.click(screen.getByText('Matched message excerpt'))

        expect(screen.getByText('No calls')).toBeInTheDocument()
        expect(
            screen
                .getByText('Matched message excerpt')
                .closest('[data-hovered="true"]'),
        ).toBeInTheDocument()
        expect(setSelectedIndex).toHaveBeenCalledWith(1)
        expect(onOpenRow).toHaveBeenCalledWith(ticketRow, false)
    })

    it('opens rows in a new tab when the modifier key is held', () => {
        const onOpenRow = vi.fn().mockResolvedValue(undefined)

        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={onOpenRow}
                onSelectSection={vi.fn()}
                selectedSection="all"
                sections={[
                    {
                        id: 'tickets',
                        title: 'Tickets',
                        recentTitle: 'Recently accessed tickets',
                        rows: [{ row: ticketRow, globalIndex: 1 }],
                        totalCount: 1,
                        emptyMessage: 'No tickets',
                    },
                ]}
                selectedIndex={1}
                setRowRef={vi.fn()}
                setSelectedIndex={vi.fn()}
            />,
        )

        fireEvent.click(screen.getByText('Refund request'), {
            ctrlKey: true,
        })

        expect(onOpenRow).toHaveBeenCalledWith(ticketRow, true)
    })

    it('renders loading rows for both customer and entity tables', () => {
        render(
            <SearchSpotlightSection
                isSearchMode={true}
                onOpenRow={vi.fn()}
                onSelectSection={vi.fn()}
                selectedSection="customers"
                sections={[
                    {
                        id: 'customers',
                        title: 'Customers',
                        recentTitle: 'Recently accessed customers',
                        rows: [{ row: customerRow, globalIndex: 0 }],
                        totalCount: 5,
                        emptyMessage: 'No customers',
                    },
                    {
                        id: 'tickets',
                        title: 'Tickets',
                        recentTitle: 'Recently accessed tickets',
                        rows: [{ row: ticketRow, globalIndex: 1 }],
                        totalCount: 5,
                        emptyMessage: 'No tickets',
                    },
                ]}
                selectedIndex={0}
                setRowRef={vi.fn()}
                setSelectedIndex={vi.fn()}
                showLoadingMoreRows={true}
            />,
        )

        expect(
            document.querySelectorAll('[data-name="skeleton"]').length,
        ).toBeGreaterThan(0)
        expect(
            screen.queryByRole('link', { name: /more results/i }),
        ).not.toBeInTheDocument()
    })
})
