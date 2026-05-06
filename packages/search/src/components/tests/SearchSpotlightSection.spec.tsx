import { render } from '@repo/testing/vitest'
import { fireEvent, screen } from '@testing-library/react'

import type {
    SearchCallRow,
    SearchCustomerRow,
    SearchTicketRow,
} from '../../types'
import { SearchSpotlightSection } from '../SearchSpotlightSection'

import css from '../SearchSpotlightRoot.module.less'

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
                onRowLinkClick={vi.fn()}
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
        expect(screen.getByText('Refund request').closest('a')).toHaveAttribute(
            'href',
            '/app/ticket/202',
        )
        expect(
            screen.getByText('Matched message excerpt').closest('a'),
        ).toHaveAttribute('href', '/app/ticket/202')
    })

    it('shows more results in all-search mode and switches sections on click', async () => {
        const onSelectSection = vi.fn()
        const { user } = render(
            <SearchSpotlightSection
                isSearchMode={true}
                onOpenRow={vi.fn()}
                onRowLinkClick={vi.fn()}
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

    it('renders hidden-match links and keeps them out of the tab order', () => {
        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={vi.fn()}
                onRowLinkClick={vi.fn()}
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
                setSelectedIndex={vi.fn()}
            />,
        )

        expect(screen.getByText('No calls')).toBeInTheDocument()
        expect(screen.getByText('Refund request').closest('a')).toHaveClass(
            css.resultCellMergedPrimaryLink,
        )
        expect(
            screen.getByText('Matched message excerpt').closest('a'),
        ).toHaveAttribute('tabindex', '-1')

        fireEvent.mouseEnter(
            screen.getByText('Matched message excerpt').closest('tr')!,
        )

        expect(
            screen.getByText('Refund request').closest('tr'),
        ).toHaveAttribute('data-hovered', 'true')
    })

    it('uses visible cell content for link names', () => {
        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={vi.fn()}
                onRowLinkClick={vi.fn()}
                onSelectSection={vi.fn()}
                selectedSection="all"
                sections={[
                    {
                        id: 'customers',
                        title: 'Customers',
                        recentTitle: 'Recently accessed customers',
                        rows: [{ row: customerRow, globalIndex: 0 }],
                        totalCount: 1,
                        emptyMessage: 'No customers',
                    },
                    {
                        id: 'calls',
                        title: 'Calls',
                        recentTitle: 'Recently accessed calls',
                        rows: [{ row: callRow, globalIndex: 1 }],
                        totalCount: 1,
                        emptyMessage: 'No calls',
                    },
                ]}
                selectedIndex={0}
                setRowRef={vi.fn()}
                setSelectedIndex={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('link', { name: 'ada@example.com' }),
        ).toHaveAttribute('href', '/app/customers/101')
        expect(
            screen.queryByRole('link', { name: 'Ada Lovelace email' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getAllByRole('link', { name: 'Callback request' }),
        ).toHaveLength(2)
    })

    it('delegates linked row clicks through onRowLinkClick instead of onOpenRow', () => {
        const onOpenRow = vi.fn().mockResolvedValue(undefined)
        const onRowLinkClick = vi.fn()

        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={onOpenRow}
                onRowLinkClick={onRowLinkClick}
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
                setSelectedIndex={vi.fn()}
            />,
        )

        fireEvent.click(screen.getByText('Refund request').closest('a')!, {
            ctrlKey: true,
        })

        const [event, row, rowIndex] = onRowLinkClick.mock.calls[0]

        expect(event.ctrlKey).toBe(true)
        expect(row).toBe(ticketRow)
        expect(rowIndex).toBe(1)
        expect(onOpenRow).not.toHaveBeenCalled()
    })

    it('opens non-linked primary and hidden-match rows through onOpenRow', () => {
        const onOpenRow = vi.fn().mockResolvedValue(undefined)
        const setSelectedIndex = vi.fn()

        const { container } = render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={onOpenRow}
                onRowLinkClick={vi.fn()}
                onSelectSection={vi.fn()}
                selectedSection="all"
                sections={[
                    {
                        id: 'tickets',
                        title: 'Tickets',
                        recentTitle: 'Recently accessed tickets',
                        rows: [
                            {
                                row: {
                                    ...ticketRow,
                                    url: '',
                                },
                                globalIndex: 1,
                            },
                        ],
                        totalCount: 1,
                        emptyMessage: 'No tickets',
                    },
                ]}
                selectedIndex={1}
                setRowRef={vi.fn()}
                setSelectedIndex={setSelectedIndex}
            />,
        )

        fireEvent.mouseEnter(screen.getByText('Refund request'))
        expect(
            screen.getByText('Refund request').closest('[data-hovered="true"]'),
        ).toBeInTheDocument()

        const sectionGroup = screen
            .getByText('Tickets')
            .closest('[data-name="box"]')?.parentElement
        expect(sectionGroup).not.toBeNull()

        fireEvent.mouseLeave(sectionGroup!)
        expect(container.querySelector('[data-hovered="true"]')).toBeNull()

        fireEvent.click(screen.getByText('Refund request'), {
            ctrlKey: true,
            metaKey: true,
        })
        expect(setSelectedIndex).toHaveBeenCalledWith(1)
        expect(onOpenRow).toHaveBeenCalledWith(
            expect.objectContaining({ id: 202 }),
            true,
        )

        fireEvent.click(screen.getByText('Matched message excerpt'))
        expect(onOpenRow).toHaveBeenLastCalledWith(
            expect.objectContaining({ id: 202 }),
            false,
        )
    })

    it('does not render links for rows without a url', () => {
        render(
            <SearchSpotlightSection
                isSearchMode={false}
                onOpenRow={vi.fn()}
                onRowLinkClick={vi.fn()}
                onSelectSection={vi.fn()}
                selectedSection="all"
                sections={[
                    {
                        id: 'calls',
                        title: 'Calls',
                        recentTitle: 'Recently accessed calls',
                        rows: [
                            {
                                row: {
                                    ...callRow,
                                    url: undefined,
                                },
                                globalIndex: 0,
                            },
                        ],
                        totalCount: 1,
                        emptyMessage: 'No calls',
                    },
                ]}
                selectedIndex={0}
                setRowRef={vi.fn()}
                setSelectedIndex={vi.fn()}
            />,
        )

        expect(
            screen.queryByRole('link', { name: 'Callback request' }),
        ).not.toBeInTheDocument()
    })

    it('renders loading rows for both customer and entity tables', () => {
        render(
            <SearchSpotlightSection
                isSearchMode={true}
                onOpenRow={vi.fn()}
                onRowLinkClick={vi.fn()}
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
