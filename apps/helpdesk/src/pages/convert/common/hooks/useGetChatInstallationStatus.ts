import { useMemo } from 'react'

import moment from 'moment'

import type { GorgiasChatIntegration } from 'models/integration/types'
import { GorgiasChatInstallationMethod } from 'models/integration/types'

/*
 * This hook is used to determine the installation status of the chat integration.
 * The installation status determined is based on the Chat integration data,
 * but doesn't perform any API calls to verify the status.
 */
const useGetChatInstallationStatus = (
    integration: GorgiasChatIntegration | undefined,
): {
    installed: boolean
    method: GorgiasChatInstallationMethod | null
} => {
    return useMemo(() => {
        // we default to this setting because Chat doesn't track manual installations and automatically considers them installed
        const defaultInstallation = {
            installed: true,
            method: null,
        }

        // no integration or no shop connected, can be only considered to be installed manually
        if (
            integration === undefined ||
            !integration.meta?.shop_integration_id
        ) {
            return defaultInstallation
        }

        const installationMethod =
            integration.meta?.one_click_installation_method

        if (
            !installationMethod ||
            ![
                GorgiasChatInstallationMethod.ScriptTag,
                GorgiasChatInstallationMethod.ThemeAppExtension,
            ].includes(installationMethod)
        ) {
            return defaultInstallation
        }

        // if shop id is not present in the list, it's not installed with script tag
        if (
            installationMethod === GorgiasChatInstallationMethod.ScriptTag &&
            (!integration.meta?.shopify_integration_ids ||
                !integration.meta?.shopify_integration_ids.includes(
                    integration.meta?.shop_integration_id,
                ))
        ) {
            return defaultInstallation
        }

        const installationDatetime = moment(
            integration.meta?.one_click_installation_datetime || null,
        )

        // no installation time known, we can't be sure of installation status
        if (!installationDatetime.isValid()) {
            return defaultInstallation
        }

        const uninstallationDatetime = moment(
            integration.meta?.one_click_uninstallation_datetime || null,
        )

        // it was never uninstalled, so it's installed based on previous checks
        if (!uninstallationDatetime.isValid()) {
            return {
                installed: true,
                method: installationMethod,
            }
        }

        // datetimes has to be in correct timeline to be considered installed
        return installationDatetime.isAfter(uninstallationDatetime)
            ? {
                  installed: true,
                  method: installationMethod,
              }
            : defaultInstallation
    }, [integration])
}

export default useGetChatInstallationStatus
