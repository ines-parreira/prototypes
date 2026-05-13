import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type * as UseSchedulerConfigV3Module from '../../hooks/useSchedulerConfigV3'

import { useAllViews } from '../../hooks/useAllViews'
import { DEFAULT_REFRESH_CONFIG_V3 } from '../../scheduler/refreshConfigV3'
import { viewEventLogStore } from '../../store/viewEventLog'
import {
    clearViewsCount,
    markViewAsViewed,
    setViewsCount,
} from '../../store/viewsCountStore'
import {
    clearViewsCountV3,
    setLastFetchAllAtV3,
    viewsCountStoreV3,
} from '../../store/viewsCountStoreV3'
import { ViewCountDebugPanelV3 } from '../ViewCountDebugPanelV3'

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

vi.mock('../../hooks/useSchedulerConfigV3', async () => {
    const actual = await vi.importActual<typeof UseSchedulerConfigV3Module>(
        '../../hooks/useSchedulerConfigV3',
    )
    return {
        ...actual,
        useSchedulerConfigV3: vi.fn(),
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
    clearViewsCountV3()
    viewEventLogStore.setState({ events: [] })
    useAllViewsMock.mockReturnValue([inboxView])
    const { useSchedulerConfigV3 } =
        await import('../../hooks/useSchedulerConfigV3')
    vi.mocked(useSchedulerConfigV3).mockReturnValue(DEFAULT_REFRESH_CONFIG_V3)
})

describe('ViewCountDebugPanelV3', () => {
    it('renders the stat cards', () => {
        render(<ViewCountDebugPanelV3 isOpen />)

        expect(screen.getByText('Leader')).toBeInTheDocument()
        expect(screen.getByText('Next tick')).toBeInTheDocument()
        expect(screen.getByText('Total views')).toBeInTheDocument()
        expect(screen.getByText('Last fetch all')).toBeInTheDocument()
        expect(screen.getByText('Recent views')).toBeInTheDocument()
        expect(screen.getByText('Messages (5m)')).toBeInTheDocument()
        expect(screen.getByText('Views (5m)')).toBeInTheDocument()
        expect(screen.getByText('Fetch all cooldown')).toBeInTheDocument()
    })

    it('shows the total views count from useAllViews', () => {
        useAllViewsMock.mockReturnValue([
            inboxView,
            { ...inboxView, id: 2, name: 'Unassigned' },
            { ...inboxView, id: 3, name: 'All' },
        ])

        render(<ViewCountDebugPanelV3 isOpen />)

        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders an activated view in the recent set table', () => {
        setViewsCount({ 1: 42 })
        markViewAsViewed(1)

        render(<ViewCountDebugPanelV3 isOpen />)

        expect(screen.getByText('Inbox')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()
    })

    it("shows 'never' on the last-fetch-all card when no bulk fetch has fired", () => {
        render(<ViewCountDebugPanelV3 isOpen />)

        expect(screen.getByText('never')).toBeInTheDocument()
    })

    it("shows an age on the last-fetch-all card once it's been stamped", () => {
        setLastFetchAllAtV3(new Date(Date.now() - 5 * 60_000).toISOString())

        render(<ViewCountDebugPanelV3 isOpen />)

        // Format: `Nm ago`
        expect(screen.getByText(/\bago\b/)).toBeInTheDocument()
    })

    it('reflects leader status from the v3 store', () => {
        viewsCountStoreV3.setState({ isLeader: true })

        render(<ViewCountDebugPanelV3 isOpen />)

        expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('renders the Event Log heading', () => {
        render(<ViewCountDebugPanelV3 isOpen />)

        expect(screen.getByText('Event Log')).toBeInTheDocument()
    })

    it('calls onOpenChange when the close button is clicked', async () => {
        const onOpenChange = vi.fn()
        const { user } = render(
            <ViewCountDebugPanelV3 isOpen onOpenChange={onOpenChange} />,
        )

        await user.click(screen.getByRole('button', { name: /close/i }))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
