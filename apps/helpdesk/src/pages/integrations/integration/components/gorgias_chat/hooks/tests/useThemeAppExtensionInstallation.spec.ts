import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { getEnvironment, GorgiasUIEnv } from '@repo/utils'

import type { ShopifyIntegration } from 'models/integration/types'

import useThemeAppExtensionInstallation from '../useThemeAppExtensionInstallation'

jest.mock('@repo/feature-flags')
jest.mock('@repo/utils')

const mockUseFlag = useFlag as jest.Mock

describe('useThemeAppExtensionInstallation', () => {
    beforeEach(() => {
        ;(getEnvironment as jest.Mock).mockReturnValue(GorgiasUIEnv.Staging)
    })

    it.each([
        undefined, // This has a floating moment with undefined during page load.
        0, // This is the value when the flag is turned off.
    ])(
        'should return false and null if SwitchToShopifyThemeAppExtension flag is loading, or turned off.',
        (value) => {
            mockUseFlag.mockReturnValue(value)

            const shopifyIntegration = {
                created_datetime: new Date().toISOString(),
            } as ShopifyIntegration

            const { result } = renderHook(() =>
                useThemeAppExtensionInstallation(shopifyIntegration),
            )

            expect(result.current).toEqual({
                shouldUseThemeAppExtensionInstallation: false,
                themeAppExtensionInstallationUrl: null,
                themeAppExtensionEnabled: false,
            })
        },
    )

    it('should return true if shopify store created_datetime is after the switch date', () => {
        const switchTimestamp = Date.now() - 1000

        mockUseFlag.mockReturnValue(switchTimestamp.toString())

        const shopifyIntegration = {
            created_datetime: new Date().toISOString(),
            name: 'test-store',
        } as ShopifyIntegration

        const { result } = renderHook(() =>
            useThemeAppExtensionInstallation(shopifyIntegration),
        )

        expect(result.current).toEqual({
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: `https://admin.shopify.com/store/test-store/themes/current/editor?context=apps&activateAppId=de98a9b4-b32b-4d92-8c0f-210c8cbebd9e/gorgias`,
            themeAppExtensionEnabled: true,
        })
    })

    it('should return true if store is undefined', () => {
        const switchTimestamp = Date.now() + 1000

        mockUseFlag.mockReturnValue(switchTimestamp.toString())

        const { result } = renderHook(() =>
            useThemeAppExtensionInstallation(undefined),
        )

        expect(result.current).toEqual({
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: null,
            themeAppExtensionEnabled: true,
        })
    })

    it('should return false if shopify store is before the switch date', () => {
        const switchTimestamp = Date.now() + 1000

        mockUseFlag.mockReturnValue(switchTimestamp.toString())

        const shopifyIntegration = {
            created_datetime: new Date().toISOString(),
            name: 'test-store',
        } as ShopifyIntegration

        const { result } = renderHook(() =>
            useThemeAppExtensionInstallation(shopifyIntegration),
        )

        expect(result.current).toEqual({
            themeAppExtensionEnabled: true,
            shouldUseThemeAppExtensionInstallation: false,
            themeAppExtensionInstallationUrl:
                'https://admin.shopify.com/store/test-store/themes/current/editor?context=apps&activateAppId=de98a9b4-b32b-4d92-8c0f-210c8cbebd9e/gorgias',
        })
    })
})
