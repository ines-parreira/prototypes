import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type * as UseSchedulerConfigV3Module from '../../hooks/useSchedulerConfig'

import { useAllViews } from '../../hooks/useAllViews'
import { DEFAULT_REFRESH_CONFIG } from '../../scheduler/refreshConfig'
import { viewEventLogStore } from '../../store/viewEventLog'
import {
    clearViewsCount,
    markViewAsViewed,
    setViewsCount,
    viewsCountStore,
} from '../../store/viewsCountStore'
import { ViewCountDebugPanel } from '../ViewCountDebugPanel'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

vi.mock('../../hooks/useAllViews', () => ({
    useAllViews: vi.fn(),
}))

vi.mock('../../hooks/useSchedulerConfig', async () => {
    const actual = await vi.importActual<typeof UseSchedulerConfigV3Module>(
        '../../hooks/useSchedulerConfig',
    )
    return {
        ...actual,
        useSchedulerConfig: vi.fn(),
    }
})

const useAllViewsMock = vi.mocked(useAllViews)

const inboxView = {
    id: 1,
    uri: '/api/views/1',
    name: 'Inbox',
    category: 'system',
    deactivated_datetime: null,
    filters: '',
    section_id: null,
    visibility: 'shared' as const,
}

beforeEach(async () => {
    clearViewsCount()
    viewEventLogStore.setState({ events: [] })
    useAllViewsMock.mockReturnValue([inboxView])
    const { useSchedulerConfig } =
        await import('../../hooks/useSchedulerConfig')
    vi.mocked(useSchedulerConfig).mockReturnValue(DEFAULT_REFRESH_CONFIG)
})

describe('ViewCountDebugPanel', () => {
    it('renders the stat cards', () => {
        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('Leader')).toBeInTheDocument()
        expect(screen.getByText('Next tick')).toBeInTheDocument()
        expect(screen.getByText('Total views')).toBeInTheDocument()
        expect(screen.getByText('Deactivated')).toBeInTheDocument()
        expect(screen.getByText('Stale views')).toBeInTheDocument()
        expect(screen.getByText('Recent views')).toBeInTheDocument()
        expect(screen.getByText('Messages (5m)')).toBeInTheDocument()
        expect(screen.getByText('Views (5m)')).toBeInTheDocument()
    })

    it('counts views with no persisted count as stale on the StaleViews card', () => {
        useAllViewsMock.mockReturnValue([
            inboxView,
            { ...inboxView, id: 2, name: 'Unassigned' },
            { ...inboxView, id: 3, name: 'All' },
        ])

        render(<ViewCountDebugPanel isOpen />)

        // 3 views, none have a persisted count → all 3 are stale.
        expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })

    it('excludes deactivated views from the StaleViews card denominator', () => {
        useAllViewsMock.mockReturnValue([
            inboxView,
            {
                ...inboxView,
                id: 2,
                name: 'Old',
                deactivated_datetime: '2024-01-01T00:00:00Z',
            },
        ])

        render(<ViewCountDebugPanel isOpen />)

        // 1 active view (stale, no count) / 1 active view total.
        expect(screen.getByText('1 / 1')).toBeInTheDocument()
    })

    it('excludes views inside initialFetchTtlSeconds from the StaleViews card', () => {
        useAllViewsMock.mockReturnValue([
            inboxView,
            { ...inboxView, id: 2, name: 'Unassigned' },
        ])
        // Stamp view 1 as freshly fetched; leave view 2 with no entry.
        setViewsCount({ 1: 5 })

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('shows the total views count from useAllViews', () => {
        useAllViewsMock.mockReturnValue([
            inboxView,
            { ...inboxView, id: 2, name: 'Unassigned' },
            { ...inboxView, id: 3, name: 'All' },
        ])

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders an activated view in the recent set table', () => {
        setViewsCount({ 1: 42 })
        markViewAsViewed(1)

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('Inbox')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders the "never" tag in the Fetched column for a marked view with no count', () => {
        // Add the view to the LRU but don't seed a count → no lastFetchedAt.
        markViewAsViewed(1)

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('never')).toBeInTheDocument()
    })

    it('renders the per-count TTL in the TTL column (1 min for a 100-ticket view)', () => {
        // Count = 100 → ttlSecondsByCount table maps to 60 s = 1m.
        setViewsCount({ 1: 100 })
        markViewAsViewed(1)

        render(<ViewCountDebugPanel isOpen />)

        // The TtlCell renders "1m" for a 60s TTL.
        expect(screen.getByText('1m')).toBeInTheDocument()
    })

    it('renders the Recent views card with the cap', () => {
        markViewAsViewed(1)

        render(<ViewCountDebugPanel isOpen />)

        // Default maxRecentViews is 8.
        expect(screen.getByText('1 / 8')).toBeInTheDocument()
    })

    it('renders the next-tick placeholder when not the leader', () => {
        // Leader defaults to false → NextTickCard shows "—".
        render(<ViewCountDebugPanel isOpen />)

        const nextTickLabel = screen.getByText('Next tick')
        const card = nextTickLabel.closest('div')?.parentElement
        expect(card).toHaveTextContent('—')
    })

    it('renders a remaining-seconds countdown on the next-tick card when this tab is leader', () => {
        viewsCountStore.setState({
            isLeader: true,
            // 7 s in the future.
            nextTickAt: Date.now() + 7_000,
        })

        render(<ViewCountDebugPanel isOpen />)

        // formatted "Ns" with N <= 7.
        const nextTickLabel = screen.getByText('Next tick')
        const card = nextTickLabel.closest('div')?.parentElement
        expect(card?.textContent).toMatch(/\d+s/)
    })

    it('shows "now" on the next-tick card when nextTickAt is in the past', () => {
        viewsCountStore.setState({
            isLeader: true,
            nextTickAt: Date.now() - 1_000,
        })

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('now')).toBeInTheDocument()
    })

    it('shows the No-leader indicator by default', () => {
        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('No')).toBeInTheDocument()
    })

    it('counts messages from the event log over the last 5 minutes', () => {
        const now = Date.now()
        viewEventLogStore.setState({
            events: [
                {
                    timestamp: now - 60_000,
                    direction: 'outbound',
                    type: 'views-count-expired',
                    viewIds: [1, 2],
                },
                {
                    timestamp: now - 2 * 60_000,
                    direction: 'inbound',
                    type: 'views-count-updated',
                    viewIds: [1, 2, 3],
                },
                {
                    timestamp: now - 10 * 60_000,
                    direction: 'outbound',
                    type: 'views-count-expired',
                    viewIds: [4],
                },
            ],
        })

        render(<ViewCountDebugPanel isOpen />)

        // 2 messages within the 5 m window.
        const msgLabel = screen.getByText('Messages (5m)')
        const msgCard = msgLabel.closest('div')?.parentElement
        expect(msgCard).toHaveTextContent('2')

        // distinct viewIds from those 2 messages: {1, 2, 3} → 3 distinct.
        const viewsLabel = screen.getByText('Views (5m)')
        const viewsCard = viewsLabel.closest('div')?.parentElement
        expect(viewsCard).toHaveTextContent('3')
    })

    it('shows the activated view name in the recent set table', () => {
        useAllViewsMock.mockReturnValue([
            { ...inboxView, id: 9, name: 'Special view' },
        ])
        setViewsCount({ 9: 5 })
        markViewAsViewed(9)

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('Special view')).toBeInTheDocument()
    })

    it('reflects leader status from the v3 store', () => {
        viewsCountStore.setState({ isLeader: true })

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('renders the Event Log heading', () => {
        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('Event Log')).toBeInTheDocument()
    })

    it('calls onOpenChange when the close button is clicked', async () => {
        const onOpenChange = vi.fn()
        const { user } = render(
            <ViewCountDebugPanel isOpen onOpenChange={onOpenChange} />,
        )

        await user.click(screen.getByRole('button', { name: /close/i }))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
