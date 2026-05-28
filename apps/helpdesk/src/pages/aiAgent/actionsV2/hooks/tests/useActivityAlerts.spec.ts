import { renderHook } from '@repo/testing'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { useActivityAlerts } from '../useActivityAlerts'
import type { ReconnectAlert } from '../useReconnectAlerts'
import { useReconnectAlerts } from '../useReconnectAlerts'
import type { ServiceConnectionStatuses } from '../useServiceConnectionStatuses'

jest.mock('../useReconnectAlerts')

const mockUseReconnectAlerts = jest.mocked(useReconnectAlerts)

const serviceConnectionStatuses: ServiceConnectionStatuses = {
    byAppId: {},
    isError: false,
    isLoading: false,
}

const buildReconnectAlert = (
    overrides: Partial<ReconnectAlert>,
): ReconnectAlert => ({
    kind: 'reconnect',
    appId: 'app-loop',
    appName: 'Loop Returns',
    ...overrides,
})

const renderActivityAlerts = () =>
    renderHook(() =>
        useActivityAlerts({
            actions: [] as StoreWorkflowsConfiguration[],
            serviceConnectionStatuses,
        }),
    )

describe('useActivityAlerts()', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('returns an empty result when there are no reconnect alerts', () => {
        mockUseReconnectAlerts.mockReturnValue([])

        const { result } = renderActivityAlerts()

        expect(result.current).toEqual({ visible: [], overflowCount: 0 })
    })

    it('exposes every alert when the total fits under the visible limit', () => {
        const alerts = Array.from({ length: 3 }, (_, i) =>
            buildReconnectAlert({ appId: `app-${i}` }),
        )
        mockUseReconnectAlerts.mockReturnValue(alerts)

        const { result } = renderActivityAlerts()

        expect(result.current.visible).toHaveLength(3)
        expect(result.current.overflowCount).toBe(0)
    })

    it('caps visible at 10 alerts and reports the overflow count', () => {
        const alerts = Array.from({ length: 14 }, (_, i) =>
            buildReconnectAlert({ appId: `app-${i}` }),
        )
        mockUseReconnectAlerts.mockReturnValue(alerts)

        const { result } = renderActivityAlerts()

        expect(result.current.visible).toHaveLength(10)
        expect(result.current.overflowCount).toBe(4)
    })

    it('reports zero overflow when the total exactly matches the visible limit', () => {
        const alerts = Array.from({ length: 10 }, (_, i) =>
            buildReconnectAlert({ appId: `app-${i}` }),
        )
        mockUseReconnectAlerts.mockReturnValue(alerts)

        const { result } = renderActivityAlerts()

        expect(result.current.visible).toHaveLength(10)
        expect(result.current.overflowCount).toBe(0)
    })
})
