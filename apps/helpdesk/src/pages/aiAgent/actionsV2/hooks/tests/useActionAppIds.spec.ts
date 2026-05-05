import { renderHook } from '@repo/testing'

import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'

import { useActionAppIds } from '../useActionAppIds'

jest.mock('models/workflows/queries')

const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)

const mockReturn = (
    data: unknown,
): ReturnType<typeof useGetStoreWorkflowsConfigurations> =>
    ({ data }) as ReturnType<typeof useGetStoreWorkflowsConfigurations>

describe('useActionAppIds()', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('returns an empty set when there are no configurations', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(mockReturn([]))

        const { result } = renderHook(() =>
            useActionAppIds({ shopName: 'test', shopType: 'shopify' }),
        )

        expect(result.current).toEqual(new Set())
    })

    it('queries with the llm-prompt trigger filter', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(mockReturn([]))

        renderHook(() =>
            useActionAppIds({ shopName: 'my-shop', shopType: 'shopify' }),
        )

        expect(mockUseGetStoreWorkflowsConfigurations).toHaveBeenCalledWith({
            storeName: 'my-shop',
            storeType: 'shopify',
            triggers: ['llm-prompt'],
        })
    })

    it('returns app_id for third-party app entries', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockReturn([
                { id: 'cfg-1', apps: [{ type: 'app', app_id: 'loop' }] },
                { id: 'cfg-2', apps: [{ type: 'app', app_id: 'returnly' }] },
            ]),
        )

        const { result } = renderHook(() =>
            useActionAppIds({ shopName: 'test', shopType: 'shopify' }),
        )

        expect(result.current).toEqual(new Set(['loop', 'returnly']))
    })

    it('returns the type string for native shopify and recharge apps', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockReturn([
                { id: 'cfg-1', apps: [{ type: 'shopify' }] },
                { id: 'cfg-2', apps: [{ type: 'recharge' }] },
            ]),
        )

        const { result } = renderHook(() =>
            useActionAppIds({ shopName: 'test', shopType: 'shopify' }),
        )

        expect(result.current).toEqual(new Set(['shopify', 'recharge']))
    })

    it('deduplicates app ids when multiple configurations reference the same app', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockReturn([
                { id: 'cfg-1', apps: [{ type: 'app', app_id: 'loop' }] },
                { id: 'cfg-2', apps: [{ type: 'app', app_id: 'loop' }] },
                { id: 'cfg-3', apps: [{ type: 'shopify' }] },
                { id: 'cfg-4', apps: [{ type: 'shopify' }] },
            ]),
        )

        const { result } = renderHook(() =>
            useActionAppIds({ shopName: 'test', shopType: 'shopify' }),
        )

        expect(result.current).toEqual(new Set(['loop', 'shopify']))
        expect(result.current.size).toBe(2)
    })

    it('skips configurations without an apps field', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockReturn([
                { id: 'cfg-1' },
                { id: 'cfg-2', apps: null },
                { id: 'cfg-3', apps: [{ type: 'app', app_id: 'loop' }] },
            ]),
        )

        const { result } = renderHook(() =>
            useActionAppIds({ shopName: 'test', shopType: 'shopify' }),
        )

        expect(result.current).toEqual(new Set(['loop']))
    })

    it('collects ids from configurations with multiple apps', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockReturn([
                {
                    id: 'cfg-1',
                    apps: [
                        { type: 'app', app_id: 'loop' },
                        { type: 'shopify' },
                        { type: 'app', app_id: 'returnly' },
                    ],
                },
            ]),
        )

        const { result } = renderHook(() =>
            useActionAppIds({ shopName: 'test', shopType: 'shopify' }),
        )

        expect(result.current).toEqual(new Set(['loop', 'shopify', 'returnly']))
    })
})
