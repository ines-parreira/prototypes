import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import type { ShopifyIntegration } from 'models/integration/types'

import useShopifyThemeAppExtension from '../useShopifyThemeAppExtension'
import useThemeAppExtensionInstallation from '../useThemeAppExtensionInstallation'

jest.mock('../useThemeAppExtensionInstallation')

describe('useShopifyThemeAppExtension', () => {
    global.fetch = jest.fn()

    it('should initially set isInstalled to undefined', () => {
        ;(useThemeAppExtensionInstallation as jest.Mock).mockReturnValue({
            shouldUseThemeAppExtensionInstallation: true,
        })

        const { result } = renderHook(() =>
            useShopifyThemeAppExtension({
                shopifyIntegration: { id: 123 } as ShopifyIntegration,
                appUuid: 'appUuid',
            }),
        )
        expect(result.current.isInstalled).toBeUndefined()
    })

    it('should not fetch data if shopify_integration_id or appUuid is falsy', () => {
        ;(useThemeAppExtensionInstallation as jest.Mock).mockReturnValue({
            shouldUseThemeAppExtensionInstallation: true,
        })

        renderHook(() =>
            useShopifyThemeAppExtension({
                shopifyIntegration: undefined,
                appUuid: 'appUuid',
            }),
        )
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should not fetch data if feature flag hook is off', () => {
        ;(useThemeAppExtensionInstallation as jest.Mock).mockReturnValue({
            shouldUseThemeAppExtensionInstallation: false,
        })

        renderHook(() =>
            useShopifyThemeAppExtension({
                shopifyIntegration: { id: 123 } as ShopifyIntegration,
                appUuid: 'appUuid',
            }),
        )
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle successful fetch', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: true }),
        })
        ;(useThemeAppExtensionInstallation as jest.Mock).mockReturnValue({
            shouldUseThemeAppExtensionInstallation: true,
        })

        const { result } = renderHook(() =>
            useShopifyThemeAppExtension({
                shopifyIntegration: { id: 123 } as ShopifyIntegration,
                appUuid: 'appUuid',
            }),
        )

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1)
            expect(global.fetch).toHaveBeenCalledWith(
                '/integrations/shopify/123/gorgias-theme-app-extension/status/appUuid',
            )
            expect(result.current.isInstalled).toBe(true)
        })
    })

    it('should handle fetch error', async () => {
        const consoleSpy = jest.spyOn(console, 'error')
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error('Failed to fetch'),
        )
        ;(useThemeAppExtensionInstallation as jest.Mock).mockReturnValue({
            shouldUseThemeAppExtensionInstallation: true,
        })

        const { result } = renderHook(() =>
            useShopifyThemeAppExtension({
                shopifyIntegration: { id: 123 } as ShopifyIntegration,
                appUuid: 'appUuid',
            }),
        )

        // Workaround as waitForNextUpdate won't trigger for undefined -> undefined.
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100))
        })

        expect(consoleSpy).toHaveBeenCalledWith(new Error('Failed to fetch'))
        expect(result.current.isInstalled).toBeUndefined()
        consoleSpy.mockRestore()
    })
})
