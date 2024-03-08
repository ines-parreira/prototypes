import {useMemo} from 'react'
import moment from 'moment'
import {
    GorgiasChatInstallationMethod,
    GorgiasChatIntegration,
} from 'models/integration/types'

export const ONE_CLICK_INSTALLED = 'installed'

export const useGetOneClickInstallationStatus = (
    integration: GorgiasChatIntegration | undefined
) => {
    return useMemo(() => {
        if (integration === undefined) {
            return null
        }

        const installationMethod =
            integration.meta?.one_click_installation_method
        if (installationMethod !== GorgiasChatInstallationMethod.ScriptTag) {
            return null
        }

        const installationDatetime = moment(
            integration.meta?.one_click_installation_datetime || null
        )
        if (!installationDatetime.isValid()) {
            return null
        }

        const uninstallationDatetime = moment(
            integration.meta?.one_click_uninstallation_datetime || null
        )
        if (!uninstallationDatetime.isValid()) {
            return ONE_CLICK_INSTALLED
        }

        return installationDatetime.isAfter(uninstallationDatetime)
            ? ONE_CLICK_INSTALLED
            : null
    }, [integration])
}
