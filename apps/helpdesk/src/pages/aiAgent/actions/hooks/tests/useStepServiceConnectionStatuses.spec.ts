import type { ReactNode } from 'react'
import React from 'react'
import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import {
    useListServiceConnectionsByAppIds,
    useListServiceConnectionStoresByConnectionIds,
} from 'models/integration/queries'
import type {
    ServiceConnectionApiDTO,
    StoreForServiceConnectionApiDTO,
} from 'models/integration/types/serviceConnection'
import type { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { useStepServiceConnectionStatuses } from '../useStepServiceConnectionStatuses'

jest.mock('models/integration/queries', () => ({
    useListServiceConnectionsByAppIds: jest.fn(),
    useListServiceConnectionStoresByConnectionIds: jest.fn(),
}))
const mockUseListServiceConnectionsByAppIds = jest.mocked(
    useListServiceConnectionsByAppIds,
)
const mockUseListServiceConnectionStoresByConnectionIds = jest.mocked(
    useListServiceConnectionStoresByConnectionIds,
)

const buildGraph = (appIds: string[]): VisualBuilderGraph =>
    ({
        apps: appIds.map((app_id) => ({ type: 'app', app_id })),
    }) as unknown as VisualBuilderGraph

const connectionsQuery = (
    connections: Partial<ServiceConnectionApiDTO>[],
): UseQueryResult<ServiceConnectionApiDTO[]> =>
    ({
        isSuccess: true,
        isInitialLoading: false,
        isError: false,
        data: connections as ServiceConnectionApiDTO[],
        error: null,
    }) as unknown as UseQueryResult<ServiceConnectionApiDTO[]>

const storesQuery = (
    stores: Partial<StoreForServiceConnectionApiDTO>[],
): UseQueryResult<StoreForServiceConnectionApiDTO[]> =>
    ({
        isSuccess: true,
        isInitialLoading: false,
        isError: false,
        data: stores as StoreForServiceConnectionApiDTO[],
        error: null,
    }) as unknown as UseQueryResult<StoreForServiceConnectionApiDTO[]>

const renderWithQueryClient = (
    callback: () => ReturnType<typeof useStepServiceConnectionStatuses>,
) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        )
    return { ...renderHook(callback, { wrapper }), queryClient }
}

describe('useStepServiceConnectionStatuses()', () => {
    beforeEach(() => {
        mockUseListServiceConnectionsByAppIds.mockReset()
        mockUseListServiceConnectionStoresByConnectionIds.mockReset()
        mockUseListServiceConnectionsByAppIds.mockReturnValue([])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([])
    })

    it('returns hasConnection true when any connection exists for the app and no store is required', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([]),
        ])

        const { result } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true),
        )

        expect(result.current.byAppId.shipbob).toEqual({ hasConnection: true })
        expect(result.current.isLoading).toBe(false)
    })

    it('returns hasConnection false when no connections exist for the app', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([]),
        ])

        const { result } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true),
        )

        expect(result.current.byAppId.shipbob).toEqual({ hasConnection: false })
    })

    it('deduplicates app ids referenced multiple times in the graph', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([]),
        ])

        renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(
                buildGraph(['shipbob', 'shipbob']),
                true,
            ),
        )

        expect(mockUseListServiceConnectionsByAppIds).toHaveBeenLastCalledWith([
            'shipbob',
        ])
    })

    it('returns empty byAppId when enabled is false', () => {
        const { result } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), false),
        )

        expect(mockUseListServiceConnectionsByAppIds).toHaveBeenLastCalledWith(
            [],
        )
        expect(result.current.byAppId).toEqual({})
    })

    it('skips non-app graph entries when collecting app ids', () => {
        const graph = {
            apps: [{ type: 'shopify' }, { type: 'app', app_id: 'shipbob' }],
        } as unknown as VisualBuilderGraph

        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([]),
        ])

        renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(graph, true),
        )

        expect(mockUseListServiceConnectionsByAppIds).toHaveBeenLastCalledWith([
            'shipbob',
        ])
    })

    it('treats a connection as valid only if assigned to the current store id', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([
                {
                    service_connection_id: 'c1',
                    store_id: 99,
                } as Partial<StoreForServiceConnectionApiDTO>,
            ]),
        ])

        const { result } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true, 99),
        )

        expect(result.current.byAppId.shipbob).toEqual({ hasConnection: true })
    })

    it('returns hasConnection false when the connection belongs to a different store', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([
                {
                    service_connection_id: 'c1',
                    store_id: 42,
                } as Partial<StoreForServiceConnectionApiDTO>,
            ]),
        ])

        const { result } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true, 99),
        )

        expect(result.current.byAppId.shipbob).toEqual({ hasConnection: false })
    })

    it('reports isLoading while any underlying query is fetching', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            {
                isSuccess: false,
                isInitialLoading: true,
                isError: false,
                data: undefined,
                error: null,
            } as unknown as UseQueryResult<ServiceConnectionApiDTO[]>,
        ])

        const { result } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('invalidates service-connection queries when the document becomes visible', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([]),
        ])

        const { queryClient } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true),
        )
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => false,
        })

        act(() => {
            document.dispatchEvent(new Event('visibilitychange'))
        })

        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ['integration', 'service-connections'],
        })
    })

    it('does not invalidate when the document is hidden', () => {
        mockUseListServiceConnectionsByAppIds.mockReturnValue([
            connectionsQuery([{ id: 'c1', status: 'active' }]),
        ])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
            storesQuery([]),
        ])

        const { queryClient } = renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), true),
        )
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => true,
        })

        act(() => {
            document.dispatchEvent(new Event('visibilitychange'))
        })

        expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('does not register the visibility listener when disabled', () => {
        const addSpy = jest.spyOn(document, 'addEventListener')

        renderWithQueryClient(() =>
            useStepServiceConnectionStatuses(buildGraph(['shipbob']), false),
        )

        expect(
            addSpy.mock.calls.find(
                ([eventName]) => eventName === 'visibilitychange',
            ),
        ).toBeUndefined()
        addSpy.mockRestore()
    })
})
