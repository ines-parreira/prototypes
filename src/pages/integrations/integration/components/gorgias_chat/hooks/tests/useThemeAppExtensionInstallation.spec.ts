import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {ShopifyIntegration} from 'models/integration/types'

import useThemeAppExtensionInstallation from '../useThemeAppExtensionInstallation'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

describe('useThemeAppExtensionInstallation', () => {
    it.each([
        undefined, // This has a floating moment with undefined during page load.
        0, // This is the value when the flag is turned off.
    ])(
        'should return false and null if SwitchToShopifyThemeAppExtension flag is loading, or turned off.',
        (value) => {
            ;(useFlags as jest.Mock).mockReturnValue({
                [FeatureFlagKey.SwitchToShopifyThemeAppExtension]: value,
            })

            const shopifyIntegration = {
                created_datetime: new Date().toISOString(),
            } as ShopifyIntegration

            const {result} = renderHook(() =>
                useThemeAppExtensionInstallation(shopifyIntegration)
            )

            expect(result.current).toEqual({
                shouldUseThemeAppExtensionInstallation: false,
                themeAppExtensionInstallationUrl: null,
            })
        }
    )

    it('should return true if shopify store created_datetime is after the switch date', () => {
        const switchTimestamp = Date.now() - 1000

        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.SwitchToShopifyThemeAppExtension]:
                switchTimestamp.toString(),
        })

        const shopifyIntegration = {
            created_datetime: new Date().toISOString(),
            name: 'test-store',
        } as ShopifyIntegration

        const {result} = renderHook(() =>
            useThemeAppExtensionInstallation(shopifyIntegration)
        )

        expect(result.current).toEqual({
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: `https://admin.shopify.com/store/test-store/themes/current/editor?context=apps`,
        })
    })

    it('should return true if store is undefined', () => {
        const switchTimestamp = Date.now() + 1000

        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.SwitchToShopifyThemeAppExtension]:
                switchTimestamp.toString(),
        })

        const {result} = renderHook(() =>
            useThemeAppExtensionInstallation(undefined)
        )

        expect(result.current).toEqual({
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: null,
        })
    })

    it('should return false if shopify store is before the switch date', () => {
        const switchTimestamp = Date.now() + 1000

        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.SwitchToShopifyThemeAppExtension]:
                switchTimestamp.toString(),
        })

        const shopifyIntegration = {
            created_datetime: new Date().toISOString(),
            name: 'test-store',
        } as ShopifyIntegration

        const {result} = renderHook(() =>
            useThemeAppExtensionInstallation(shopifyIntegration)
        )

        expect(result.current).toEqual({
            shouldUseThemeAppExtensionInstallation: false,
            themeAppExtensionInstallationUrl:
                'https://admin.shopify.com/store/test-store/themes/current/editor?context=apps',
        })
    })
})
