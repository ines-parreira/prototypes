import React, { ComponentType } from 'react'

import { renderHook } from '@repo/testing'
import { fromJS, Map } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { GORGIAS_CHAT_INTEGRATION_TYPE } from 'constants/integration'
import { IntegrationType } from 'models/integration/constants'
import { ShopifyIntegrationMeta } from 'models/integration/types/shopify'
import { getChatInstallationStatus } from 'state/entities/chatInstallationStatus/selectors'
import { getStoreIntegrations } from 'state/integrations/selectors'
import { RootState } from 'state/types'

import useChatMigrationBanner from '../useChatMigrationBanner'

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

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('state/integrations/selectors', () => ({
    getStoreIntegrations: jest.fn(),
}))

jest.mock('state/entities/chatInstallationStatus/selectors', () => ({
    getChatInstallationStatus: jest.fn(),
}))

describe('useChatMigrationBanner', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const sixDaysAgo = new Date(
        Date.now() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString()
    const now = new Date().toISOString()

    const script_tags_scope = `['read_script_tags', 'write_script_tags']`
    const missing_scopes = `[]`

    it.each`
        featureFlagV3Banner | featureFlagScriptTag | metaOauthScope       | minSnipV | o_c_install_dt | o_c_uninstall_dt | o_c_install_m   | clickInstalled | showBanners             | description
        ${false}            | ${false}             | ${script_tags_scope} | ${'v2'}  | ${now}         | ${now}           | ${'script_tag'} | ${true}        | ${[false, false, true]} | ${'[v3-banner:N, ST-banner:N] all feature flag OFF'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v2'}  | ${undefined}   | ${undefined}     | ${undefined}    | ${false}       | ${[true, false, true]}  | ${'[v3-banner:Y, ST-banner:N] not using 1click'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v3'}  | ${undefined}   | ${undefined}     | ${undefined}    | ${false}       | ${[false, false, true]} | ${'[v3-banner:N, ST-banner:N] already v3, not using 1click'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v2'}  | ${undefined}   | ${undefined}     | ${undefined}    | ${true}        | ${[false, true, true]}  | ${'[v3-banner:N, ST-banner:Y] using 1click, having v2, not showing the 2 banners'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v2'}  | ${sixDaysAgo}  | ${sixDaysAgo}    | ${'asset'}      | ${false}       | ${[true, false, true]}  | ${'[v3-banner:Y, ST-banner:N] 1click churned > 5days'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v3'}  | ${sixDaysAgo}  | ${sixDaysAgo}    | ${'asset'}      | ${false}       | ${[false, false, true]} | ${'[v3-banner:N, ST-banner:N] already v3, 1click churned > 5days'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v3'}  | ${now}         | ${now}           | ${'asset'}      | ${false}       | ${[false, true, true]}  | ${'[v3-banner:N, ST-banner:Y] already v3, 1click churned < 5days'}
        ${true}             | ${true}              | ${missing_scopes}    | ${'v2'}  | ${undefined}   | ${undefined}     | ${undefined}    | ${true}        | ${[false, true, false]} | ${'[v3-banner:N, ST-banner:Y] using 1click, missing scope, not showing the 2 banners'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v3'}  | ${undefined}   | ${undefined}     | ${'script_tag'} | ${true}        | ${[false, false, true]} | ${'[v3-banner:N, ST-banner:N] already v3, script tab migrated'}
        ${true}             | ${true}              | ${script_tags_scope} | ${'v2'}  | ${undefined}   | ${undefined}     | ${'script_tag'} | ${true}        | ${[false, false, true]} | ${'[v3-banner:N, ST-banner:N] do not show v3 banner if script tag migrated'}
    `(
        'Should return the correct banner state ($description)',
        ({
            featureFlagV3Banner,
            featureFlagScriptTag,
            metaOauthScope,
            minSnipV,
            o_c_install_dt,
            o_c_uninstall_dt,
            o_c_install_m,
            clickInstalled,
            showBanners,
        }) => {
            mockFlags({
                [FeatureFlagKey.ChatSnippetV3Banner]: featureFlagV3Banner,
                [FeatureFlagKey.ShopifyIntegrationScopeScriptTag]:
                    featureFlagScriptTag,
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
            ;(
                getChatInstallationStatus as unknown as jest.Mock
            ).mockReturnValue({
                minimumSnippetVersion: minSnipV,
            })
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
                showSnippetV3MigrationBanner: (showBanners as boolean[])[0],
                showScriptTagMigrationBanner: (showBanners as boolean[])[1],
                hasShopifyScriptTagScope: (showBanners as boolean[])[2],
            })
        },
    )
})
