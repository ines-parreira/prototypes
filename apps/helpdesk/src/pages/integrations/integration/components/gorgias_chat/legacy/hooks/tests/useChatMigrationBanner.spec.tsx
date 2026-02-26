import type { ComponentType } from 'react'
import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { GORGIAS_CHAT_INTEGRATION_TYPE } from 'constants/integration'
import { IntegrationType } from 'models/integration/constants'
import type { ShopifyIntegrationMeta } from 'models/integration/types/shopify'
import { getStoreIntegrations } from 'state/integrations/selectors'
import type { RootState } from 'state/types'

import useChatMigrationBanner from '../useChatMigrationBanner'
import useThemeAppExtensionInstallation from '../useThemeAppExtensionInstallation'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                meta: {
                    oauth: {
                        status: 'success',
                        scope: `['read_script_tags', 'write_script_tags']`,
                    },
                } as Partial<ShopifyIntegrationMeta> as unknown as ShopifyIntegrationMeta,
            },
        ],
    }),
} as RootState

jest.mock('@repo/feature-flags')

jest.mock('state/integrations/selectors', () => ({
    getStoreIntegrations: jest.fn(),
}))

jest.mock('../useThemeAppExtensionInstallation', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

describe('useChatMigrationBanner', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const sixDaysAgo = new Date(
        Date.now() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString()
    const now = new Date().toISOString()

    const script_tags_scope = `['read_script_tags', 'write_script_tags']`

    it.each`
        themeAppExtensionEnabled | metaOauthScope       | o_c_install_dt | o_c_uninstall_dt | o_c_install_m            | clickInstalled | showBanner | hasScope | description
        ${false}                 | ${script_tags_scope} | ${now}         | ${now}           | ${'asset'}               | ${true}        | ${false}   | ${true}  | ${'Banner hidden when theme extension feature is disabled'}
        ${true}                  | ${script_tags_scope} | ${undefined}   | ${undefined}     | ${undefined}             | ${false}       | ${false}   | ${true}  | ${'Banner hidden when not using 1click'}
        ${true}                  | ${script_tags_scope} | ${undefined}   | ${undefined}     | ${'theme_app_extension'} | ${true}        | ${false}   | ${true}  | ${'Banner hidden when already using theme app extension'}
        ${true}                  | ${script_tags_scope} | ${now}         | ${undefined}     | ${'asset'}               | ${true}        | ${true}    | ${true}  | ${'Banner shown when using asset method with 1click'}
        ${true}                  | ${script_tags_scope} | ${now}         | ${undefined}     | ${'script_tag'}          | ${true}        | ${true}    | ${true}  | ${'Banner shown when using script_tag method'}
        ${true}                  | ${script_tags_scope} | ${sixDaysAgo}  | ${sixDaysAgo}    | ${'asset'}               | ${false}       | ${false}   | ${true}  | ${'Banner hidden when 1click churned > 5days'}
        ${true}                  | ${script_tags_scope} | ${now}         | ${now}           | ${'asset'}               | ${false}       | ${true}    | ${true}  | ${'Banner shown when 1click churned < 5days'}
    `(
        'Should return the correct banner state ($description)',
        ({
            themeAppExtensionEnabled,
            metaOauthScope,
            o_c_install_dt,
            o_c_uninstall_dt,
            o_c_install_m,
            clickInstalled,
            showBanner,
            hasScope,
        }) => {
            mockUseFlag.mockImplementation((flagKey: FeatureFlagKey) => {
                if (
                    flagKey === FeatureFlagKey.SwitchToShopifyThemeAppExtension
                ) {
                    return themeAppExtensionEnabled ? Date.now() : false
                }
                return false
            })
            ;(useThemeAppExtensionInstallation as jest.Mock).mockReturnValue({
                themeAppExtensionEnabled,
                shouldUseThemeAppExtensionInstallation:
                    themeAppExtensionEnabled,
                themeAppExtensionInstallationUrl: null,
            })
            ;(getStoreIntegrations as unknown as jest.Mock).mockReturnValue([
                {
                    id: 1,
                    type: IntegrationType.Shopify,
                    meta: {
                        oauth: {
                            status: 'success',
                            scope: metaOauthScope,
                        },
                    } as Partial<ShopifyIntegrationMeta> as unknown as ShopifyIntegrationMeta,
                },
            ])

            const mockChatIntegration = fromJS({
                id: 2,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    shop_integration_id: 1,
                    shopify_integration_ids: clickInstalled ? [1] : [],
                    one_click_installation_datetime: o_c_install_dt,
                    one_click_uninstallation_datetime: o_c_uninstall_dt,
                    one_click_installation_method: o_c_install_m,
                },
            }) as Map<any, any>

            const store = createStore(
                (state) => state as RootState,
                defaultState,
            )
            const hookOptions = {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }

            const { result } = renderHook(
                () => useChatMigrationBanner(mockChatIntegration),
                hookOptions,
            )

            expect(result.current).toEqual({
                showThemeExtensionsMigrationBanner: showBanner,
                hasShopifyScriptTagScope: hasScope,
            })
        },
    )
})
