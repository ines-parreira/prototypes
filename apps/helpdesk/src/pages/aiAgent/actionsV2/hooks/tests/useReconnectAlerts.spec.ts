import { renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { useGetAppsByIds } from 'models/integration/queries'
import type { AppData } from 'models/integration/types/app'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { useReconnectAlerts } from '../useReconnectAlerts'
import type { ServiceConnectionStatuses } from '../useServiceConnectionStatuses'

jest.mock('models/integration/queries', () => ({
    useGetAppsByIds: jest.fn(),
}))
const mockUseGetAppsByIds = jest.mocked(useGetAppsByIds)

const buildAction = (appIds: string[]): StoreWorkflowsConfiguration =>
    ({
        id: `cfg-${appIds.join('-')}`,
        apps: appIds.map((app_id) => ({ type: 'app', app_id })),
    }) as unknown as StoreWorkflowsConfiguration

const appQuery = (data: Partial<AppData>): UseQueryResult<AppData> =>
    ({
        isSuccess: true,
        data: data as AppData,
    }) as unknown as UseQueryResult<AppData>

const okStatuses = (
    byAppId: ServiceConnectionStatuses['byAppId'] = {},
): ServiceConnectionStatuses => ({
    byAppId,
    isError: false,
    isLoading: false,
})

describe('useReconnectAlerts()', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('returns an empty list when service connection statuses errored', () => {
        mockUseGetAppsByIds.mockReturnValue([
            appQuery({ id: 'app-loop', name: 'Loop Returns' }),
        ])
        const { result } = renderHook(() =>
            useReconnectAlerts({
                actions: [buildAction(['app-loop'])],
                serviceConnectionStatuses: {
                    byAppId: { 'app-loop': { isBroken: true } },
                    isError: true,
                    isLoading: false,
                },
            }),
        )

        expect(result.current).toEqual([])
    })

    it('emits one alert per broken app', () => {
        mockUseGetAppsByIds.mockReturnValue([
            appQuery({
                id: 'app-loop',
                name: 'Loop Returns',
                app_icon: 'loop.png',
            }),
        ])

        const { result } = renderHook(() =>
            useReconnectAlerts({
                actions: [buildAction(['app-loop'])],
                serviceConnectionStatuses: okStatuses({
                    'app-loop': {
                        isBroken: true,
                        brokenConnectionId: 'c1',
                    },
                }),
            }),
        )

        expect(result.current).toEqual([
            {
                kind: 'reconnect',
                appId: 'app-loop',
                appName: 'Loop Returns',
                appIcon: 'loop.png',
            },
        ])
    })

    it('skips apps whose connections are healthy', () => {
        mockUseGetAppsByIds.mockReturnValue([
            appQuery({ id: 'app-loop', name: 'Loop Returns' }),
        ])

        const { result } = renderHook(() =>
            useReconnectAlerts({
                actions: [buildAction(['app-loop'])],
                serviceConnectionStatuses: okStatuses({
                    'app-loop': { isBroken: false },
                }),
            }),
        )

        expect(result.current).toEqual([])
    })

    it('skips apps whose service connection status is unknown', () => {
        mockUseGetAppsByIds.mockReturnValue([
            appQuery({ id: 'app-loop', name: 'Loop Returns' }),
        ])

        const { result } = renderHook(() =>
            useReconnectAlerts({
                actions: [buildAction(['app-loop'])],
                serviceConnectionStatuses: okStatuses(),
            }),
        )

        expect(result.current).toEqual([])
    })

    it('skips apps whose AppData query has not resolved yet', () => {
        mockUseGetAppsByIds.mockReturnValue([
            {
                isSuccess: false,
                data: undefined,
            } as unknown as UseQueryResult<AppData>,
        ])

        const { result } = renderHook(() =>
            useReconnectAlerts({
                actions: [buildAction(['app-loop'])],
                serviceConnectionStatuses: okStatuses({
                    'app-loop': { isBroken: true },
                }),
            }),
        )

        expect(result.current).toEqual([])
    })
})
