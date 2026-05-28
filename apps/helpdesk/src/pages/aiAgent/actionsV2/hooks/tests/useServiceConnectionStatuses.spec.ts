import { renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { useListServiceConnectionsByAppIds } from 'models/integration/queries'
import type { ServiceConnectionApiDTO } from 'models/integration/types/serviceConnection'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { useServiceConnectionStatuses } from '../useServiceConnectionStatuses'

jest.mock('models/integration/queries', () => ({
    useListServiceConnectionsByAppIds: jest.fn(),
}))
const mockUseListServiceConnectionsByAppIds = jest.mocked(
    useListServiceConnectionsByAppIds,
)

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const buildAction = (appIds: string[]): StoreWorkflowsConfiguration =>
    ({
        id: `cfg-${appIds.join('-')}`,
        apps: appIds.map((app_id) => ({ type: 'app', app_id })),
    }) as unknown as StoreWorkflowsConfiguration

const successQuery = (
    connections: Partial<ServiceConnectionApiDTO>[],
): UseQueryResult<ServiceConnectionApiDTO[]> =>
    ({
        isSuccess: true,
        isInitialLoading: false,
        isError: false,
        data: connections as ServiceConnectionApiDTO[],
        error: null,
    }) as unknown as UseQueryResult<ServiceConnectionApiDTO[]>

const errorQuery = (
    err: unknown = new Error('boom'),
): UseQueryResult<ServiceConnectionApiDTO[]> =>
    ({
        isSuccess: false,
        isInitialLoading: false,
        isError: true,
        data: undefined,
        error: err,
    }) as unknown as UseQueryResult<ServiceConnectionApiDTO[]>

describe('useServiceConnectionStatuses()', () => {
    beforeEach(() => {
        mockUseListServiceConnectionsByAppIds.mockReset()
    })

    it('marks an app as broken when one of its connections is invalid', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            successQuery([
                { id: 'c1', status: 'invalid' },
                { id: 'c2', status: 'active' },
            ]),
        ])

        const { result } = renderHook(() =>
            useServiceConnectionStatuses([buildAction(['shipbob'])]),
        )

        expect(result.current.byAppId.shipbob).toEqual({
            isBroken: true,
            brokenConnectionId: 'c1',
        })
        expect(result.current.isError).toBe(false)
        expect(result.current.isLoading).toBe(false)
    })

    it('marks an app as healthy when all connections are active', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            successQuery([{ id: 'c1', status: 'active' }]),
        ])

        const { result } = renderHook(() =>
            useServiceConnectionStatuses([buildAction(['shipbob'])]),
        )

        expect(result.current.byAppId.shipbob).toEqual({
            isBroken: false,
            brokenConnectionId: undefined,
        })
    })

    it('reports isError when at least one query errored', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([errorQuery()])

        const { result } = renderHook(() =>
            useServiceConnectionStatuses([buildAction(['shipbob'])]),
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.byAppId).toEqual({})
    })

    it('returns an empty map when no actions reference any apps', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([])

        const { result } = renderHook(() =>
            useServiceConnectionStatuses([buildAction([])]),
        )

        expect(result.current.byAppId).toEqual({})
        expect(result.current.isError).toBe(false)
    })

    it('deduplicates appIds referenced across multiple actions', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            successQuery([{ id: 'c1', status: 'invalid' }]),
        ])

        const { result } = renderHook(() =>
            useServiceConnectionStatuses([
                buildAction(['shipbob']),
                buildAction(['shipbob']),
            ]),
        )

        expect(mockUseListServiceConnectionsByAppIds).toHaveBeenLastCalledWith([
            'shipbob',
        ])
        expect(result.current.byAppId.shipbob?.isBroken).toBe(true)
    })
})
