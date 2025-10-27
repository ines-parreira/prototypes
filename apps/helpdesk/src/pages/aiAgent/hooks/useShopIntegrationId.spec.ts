import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { useShopIntegrationId } from './useShopIntegrationId'

jest.mock('hooks/useAppSelector')
jest.mock('state/integrations/selectors')

describe('useShopIntegrationId', () => {
    const mockShopifyIntegrations = [
        { id: 1, name: 'Shop A' },
        { id: 2, name: 'Shop B' },
        { id: 3, name: 'Shop C' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return mockShopifyIntegrations
            }
            return []
        })
    })

    it('should return integration id when shop name matches', () => {
        const { result } = renderHook(() => useShopIntegrationId('Shop B'))

        expect(result.current).toBe(2)
    })

    it('should return undefined when shopName is undefined', () => {
        const { result } = renderHook(() => useShopIntegrationId(undefined))

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when shop name is not found', () => {
        const { result } = renderHook(() =>
            useShopIntegrationId('Non-existent Shop'),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return first matching integration id', () => {
        const { result } = renderHook(() => useShopIntegrationId('Shop A'))

        expect(result.current).toBe(1)
    })

    it('should return last matching integration id', () => {
        const { result } = renderHook(() => useShopIntegrationId('Shop C'))

        expect(result.current).toBe(3)
    })

    it('should handle empty integrations array', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return []
            }
            return []
        })

        const { result } = renderHook(() => useShopIntegrationId('Shop A'))

        expect(result.current).toBeUndefined()
    })

    it('should handle integration with undefined id', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [{ id: undefined, name: 'Shop A' }]
            }
            return []
        })

        const { result } = renderHook(() => useShopIntegrationId('Shop A'))

        expect(result.current).toBeUndefined()
    })

    it('should handle integration with null id', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [{ id: null, name: 'Shop A' }]
            }
            return []
        })

        const { result } = renderHook(() => useShopIntegrationId('Shop A'))

        expect(result.current).toBeUndefined()
    })

    it('should be case-sensitive when matching shop names', () => {
        const { result } = renderHook(() => useShopIntegrationId('shop b'))

        expect(result.current).toBeUndefined()
    })

    it('should handle shop names with special characters', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [{ id: 99, name: "Shop's & Co." }]
            }
            return []
        })

        const { result } = renderHook(() =>
            useShopIntegrationId("Shop's & Co."),
        )

        expect(result.current).toBe(99)
    })

    it('should handle shop names with whitespace', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [{ id: 100, name: '  Shop With Spaces  ' }]
            }
            return []
        })

        const { result } = renderHook(() =>
            useShopIntegrationId('  Shop With Spaces  '),
        )

        expect(result.current).toBe(100)
    })

    it('should update result when shopName changes', () => {
        const { result, rerender } = renderHook(
            ({ shopName }) => useShopIntegrationId(shopName),
            {
                initialProps: { shopName: 'Shop A' },
            },
        )

        expect(result.current).toBe(1)

        rerender({ shopName: 'Shop B' })

        expect(result.current).toBe(2)
    })

    it('should update result when integrations change', () => {
        const { result, rerender } = renderHook(() =>
            useShopIntegrationId('Shop D'),
        )

        expect(result.current).toBeUndefined()
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [...mockShopifyIntegrations, { id: 4, name: 'Shop D' }]
            }
            return []
        })

        rerender()

        expect(result.current).toBe(4)
    })

    it('should handle empty string shop name', () => {
        const { result } = renderHook(() => useShopIntegrationId(''))

        expect(result.current).toBeUndefined()
    })

    it('should use useAppSelector with correct selector', () => {
        renderHook(() => useShopIntegrationId('Shop A'))

        expect(useAppSelector).toHaveBeenCalledWith(
            getShopifyIntegrationsSortedByName,
        )
    })

    it('should return integration id 0 when it exists', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [{ id: 0, name: 'Shop Zero' }]
            }
            return []
        })

        const { result } = renderHook(() => useShopIntegrationId('Shop Zero'))

        expect(result.current).toBe(0)
    })

    it('should handle multiple integrations with same name and return first match', () => {
        ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [
                    { id: 10, name: 'Duplicate Shop' },
                    { id: 20, name: 'Duplicate Shop' },
                ]
            }
            return []
        })

        const { result } = renderHook(() =>
            useShopIntegrationId('Duplicate Shop'),
        )

        expect(result.current).toBe(10)
    })
})
