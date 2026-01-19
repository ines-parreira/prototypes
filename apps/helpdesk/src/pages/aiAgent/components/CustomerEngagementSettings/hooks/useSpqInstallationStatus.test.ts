import { act, renderHook, waitFor } from '@testing-library/react'

import type { ShopifyIntegration } from 'models/integration/types'

import useSpqInstallationStatus from './useSpqInstallationStatus'

const mockShopifyIntegration = {
    id: 123,
} as unknown as ShopifyIntegration

describe('useSpqInstallationStatus', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    it('should return undefined and not loaded when shopifyIntegration is undefined', async () => {
        const { result } = renderHook(() => useSpqInstallationStatus(undefined))

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBeUndefined()
    })

    it('should fetch SPQ status and return is_installed true', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: true }),
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        expect(result.current.isLoaded).toBe(false)

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/integrations/shopify/123/spq/status/',
        )
        expect(result.current.isSpqInstalled).toBe(true)
    })

    it('should fetch SPQ status and return is_installed false', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: false }),
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(false)
    })

    it('should handle fetch error and set isSpqInstalled to undefined', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'))

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBeUndefined()
        expect(consoleErrorSpy).toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
    })

    it('should refetch when shopifyIntegration id changes', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ is_installed: true }),
            })
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ is_installed: false }),
            })

        const { result, rerender } = renderHook(
            (props: { integration: ShopifyIntegration | undefined }) =>
                useSpqInstallationStatus(props.integration),
            {
                initialProps: { integration: mockShopifyIntegration },
            },
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(true)

        const updatedIntegration: ShopifyIntegration = {
            ...mockShopifyIntegration,
            id: 456,
        }

        await act(async () => {
            rerender({ integration: updatedIntegration })
        })

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
            expect(result.current.isSpqInstalled).toBe(false)
        })

        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(global.fetch).toHaveBeenLastCalledWith(
            '/integrations/shopify/456/spq/status/',
        )
    })

    it('should not fetch when shopifyIntegration has no id', async () => {
        global.fetch = jest.fn()

        const integrationWithoutId = {
            ...mockShopifyIntegration,
            id: undefined,
        } as unknown as ShopifyIntegration

        const { result } = renderHook(() =>
            useSpqInstallationStatus(integrationWithoutId),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(global.fetch).not.toHaveBeenCalled()
        expect(result.current.isSpqInstalled).toBeUndefined()
    })
})
