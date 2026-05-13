import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type * as UseViewCountSchedulerVersionModule from '../../hooks/useViewCountSchedulerVersion'

import { useAllViews } from '../../hooks/useAllViews'
import { useHasNewViewCountScheduler } from '../../hooks/useHasNewViewCountScheduler'
import { useSchedulerConfig } from '../../hooks/useSchedulerConfig'
import {
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '../../hooks/useViewCountSchedulerVersion'
import { DEFAULT_REFRESH_CONFIG } from '../../scheduler/selectViewsToRefresh'
import { viewEventLogStore } from '../../store/viewEventLog'
import {
    clearViewsCount,
    setScores,
    setViewportViewIds,
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

vi.mock('../../hooks/useHasNewViewCountScheduler', () => ({
    useHasNewViewCountScheduler: vi.fn(),
}))

vi.mock('../../hooks/useViewCountSchedulerVersion', async () => {
    const actual = await vi.importActual<
        typeof UseViewCountSchedulerVersionModule
    >('../../hooks/useViewCountSchedulerVersion')
    return {
        ...actual,
        useViewCountSchedulerVersion: vi.fn(),
    }
})

vi.mock('../../hooks/useAllViews', () => ({
    useAllViews: vi.fn(),
}))

vi.mock('../../hooks/useSchedulerConfig', () => ({
    useSchedulerConfig: vi.fn(),
}))

const useHasNewViewCountSchedulerMock = vi.mocked(useHasNewViewCountScheduler)
const useViewCountSchedulerVersionMock = vi.mocked(useViewCountSchedulerVersion)
const useAllViewsMock = vi.mocked(useAllViews)
const useSchedulerConfigMock = vi.mocked(useSchedulerConfig)

function mockHasNewScheduler(value: boolean) {
    useHasNewViewCountSchedulerMock.mockReturnValue({ value, isLoading: false })
    useViewCountSchedulerVersionMock.mockReturnValue({
        version: value
            ? ViewCountSchedulerVersion.V2
            : ViewCountSchedulerVersion.Legacy,
        isLoading: false,
    })
}

const view = {
    id: 1,
    uri: '/api/views/1',
    name: 'Open tickets',
    category: 'system',
    deactivated_datetime: null,
    filters: `ticket.channel = "chat"`,
    section_id: null,
    visibility: 'shared' as const,
}

beforeEach(() => {
    clearViewsCount()
    viewEventLogStore.setState({ events: [] })
    viewsCountStore.setState({ isLeader: true, activeViewId: 1 })
    setViewportViewIds([1])
    setScores({ 1: 42 })
    mockHasNewScheduler(false)
    useAllViewsMock.mockReturnValue([view])
    useSchedulerConfigMock.mockReturnValue(DEFAULT_REFRESH_CONFIG)
})

describe('ViewCountDebugPanel', () => {
    it('shows fallback copy when the new view count scheduler is disabled', () => {
        render(<ViewCountDebugPanel isOpen />)

        expect(
            screen.getByText(
                /The Helpdesk v2 beta is disabled \(flag or user toggle\), so view counts are fetched by the legacy scheduler\./,
            ),
        ).toBeInTheDocument()
    })

    it('builds debug rows when the new view count scheduler is enabled', () => {
        mockHasNewScheduler(true)
        setViewsCount({ 1: 12 })

        render(<ViewCountDebugPanel isOpen />)

        expect(screen.getByText('Open tickets')).toBeInTheDocument()
        expect(screen.getByText('12')).toBeInTheDocument()
    })
})
