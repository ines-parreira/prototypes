import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {
    GorgiasChatInstallationMethod,
    GorgiasChatIntegration,
} from 'models/integration/types'
import useGetChatInstallationStatus from 'pages/convert/common/hooks/useGetChatInstallationStatus'

const integrationWithScriptTagAndValidDates = {
    meta: {
        one_click_installation_method: GorgiasChatInstallationMethod.ScriptTag,
        one_click_installation_datetime: moment()
            .subtract(1, 'days')
            .toISOString(),
        one_click_uninstallation_datetime: moment().toISOString(),
        shop_integration_id: 1,
        shopify_integration_ids: [1],
    },
} as GorgiasChatIntegration

describe('useGetOneClickInstallationStatus', () => {
    const oneClickScriptTagInstalled = {
        installed: true,
        method: GorgiasChatInstallationMethod.ScriptTag,
    }
    const oneClickThemeAppExtensionInstalled = {
        installed: true,
        method: GorgiasChatInstallationMethod.ThemeAppExtension,
    }
    const defaultInstallation = {
        installed: true,
        method: null,
    }

    const integration = {
        meta: {
            one_click_installation_method:
                GorgiasChatInstallationMethod.ScriptTag,
            one_click_installation_datetime: moment().toISOString(),
            shop_integration_id: 1,
            shopify_integration_ids: [1],
        },
    } as GorgiasChatIntegration

    it('should return "installed" for a valid installation without an uninstallation date', () => {
        const {result} = renderHook(() =>
            useGetChatInstallationStatus(integration)
        )
        expect(result.current).toStrictEqual(oneClickScriptTagInstalled)
    })

    it('should return "installed" for a valid installation via theme app extension', () => {
        const {result} = renderHook(() =>
            useGetChatInstallationStatus({
                ...integration,
                meta: {
                    ...integration.meta,
                    one_click_installation_method:
                        GorgiasChatInstallationMethod.ThemeAppExtension,
                },
            })
        )
        expect(result.current).toStrictEqual(oneClickThemeAppExtensionInstalled)
    })

    it('should return "default" for no integration', () => {
        const {result} = renderHook(() =>
            useGetChatInstallationStatus(undefined)
        )
        expect(result.current).toStrictEqual(defaultInstallation)
    })

    it('should return "default" for no shop connected', () => {
        const invalidIntegration = {
            ...integration,
            meta: {
                ...integrationWithScriptTagAndValidDates.meta,
                shop_integration_id: null,
                shopify_integration_ids: [],
            },
        }

        const {result} = renderHook(() =>
            useGetChatInstallationStatus(invalidIntegration)
        )
        expect(result.current).toStrictEqual(defaultInstallation)
    })

    it('should return null for an invalid installation method', () => {
        const invalidMethodIntegration = {
            ...integration,
            meta: {
                ...integrationWithScriptTagAndValidDates.meta,
                one_click_installation_method:
                    GorgiasChatInstallationMethod.Asset,
            },
        }

        const {result} = renderHook(() =>
            useGetChatInstallationStatus(invalidMethodIntegration)
        )
        expect(result.current).toStrictEqual(defaultInstallation)
    })

    it('should return null for invalid installation datetime', () => {
        const invalidDatesIntegration = {
            ...integration,
            meta: {
                ...integrationWithScriptTagAndValidDates.meta,
                one_click_installation_datetime: 'invalid date',
            },
        }

        const {result} = renderHook(() =>
            useGetChatInstallationStatus(invalidDatesIntegration)
        )
        expect(result.current).toStrictEqual(defaultInstallation)
    })

    it('should return "installed" if the installation date is after the uninstallation date', () => {
        const integrationWithBothDates = {
            meta: {
                ...integration.meta,
                one_click_uninstallation_datetime: moment()
                    .subtract(1, 'days')
                    .toISOString(),
            },
        } as GorgiasChatIntegration

        const {result} = renderHook(() =>
            useGetChatInstallationStatus(integrationWithBothDates)
        )
        expect(result.current).toStrictEqual(oneClickScriptTagInstalled)
    })

    it('should return null if the installation date is before the uninstallation date', () => {
        const integrationWithBothDates = {
            meta: {
                ...integration.meta,
                one_click_uninstallation_datetime: moment()
                    .add(1, 'days')
                    .toISOString(),
            },
        } as GorgiasChatIntegration

        const {result} = renderHook(() =>
            useGetChatInstallationStatus(integrationWithBothDates)
        )
        expect(result.current).toStrictEqual(defaultInstallation)
    })
})
