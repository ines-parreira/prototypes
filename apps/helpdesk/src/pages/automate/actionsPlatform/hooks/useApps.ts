import { useMemo } from 'react'

import { DefinedUseQueryResult } from '@tanstack/react-query'
import _keyBy from 'lodash/keyBy'

import { INTEGRATION_TYPE_CONFIG, IntegrationConfig } from 'config'
import { IntegrationType } from 'models/integration/constants'
import { useGetApps, useGetAppsByIds } from 'models/integration/queries'
import { AppData } from 'models/integration/types'
import { useListActionsApps } from 'models/workflows/queries'
import { assetsUrl } from 'utils'

import { App } from '../types'

type NativeAppIntegrationConfig = Omit<IntegrationConfig, 'type' | 'image'> & {
    type: IntegrationType.Shopify | IntegrationType.Recharge
    image: string
}

const NATIVE_APPS_TYPES = [IntegrationType.Shopify, IntegrationType.Recharge]
const NATIVE_APPS: App[] = INTEGRATION_TYPE_CONFIG.filter(
    (integration): integration is NativeAppIntegrationConfig =>
        NATIVE_APPS_TYPES.includes(integration.type),
).map((integration) => ({
    id: integration.type,
    type: integration.type,
    name: integration.title,
    icon: assetsUrl(integration.image),
}))

const useApps = <T extends App['type'] = App['type']>(
    types = [
        IntegrationType.Shopify,
        IntegrationType.Recharge,
        IntegrationType.App,
    ] as T[],
) => {
    const {
        data: actionsApps = [],
        isInitialLoading: isActionsAppsInitialLoading,
    } = useListActionsApps()
    const actionsAppsById = useMemo(
        () => _keyBy(actionsApps, 'id'),
        [actionsApps],
    )
    const { data: appsList = [], isInitialLoading } = useGetApps()

    const missingApps = useMemo(() => {
        if (isInitialLoading || isActionsAppsInitialLoading) {
            return []
        }

        const appById = _keyBy(appsList, 'id')

        return actionsApps
            .filter((actionsApp) => !(actionsApp.id in appById))
            .map((actionsApp) => actionsApp.id)
    }, [appsList, actionsApps, isInitialLoading, isActionsAppsInitialLoading])

    const appQueries = useGetAppsByIds(missingApps)

    const apps = useMemo<
        Array<Extract<App & { installed?: boolean }, { type: T }>>
    >(
        () =>
            [
                ...NATIVE_APPS,
                ...appsList.map((item) => ({
                    id: item.id,
                    type: IntegrationType.App as const,
                    name: actionsAppsById[item.id]?.name || item.name,
                    icon: item.app_icon,
                    installed: item.is_installed,
                })),
                ...appQueries
                    .filter(
                        (query): query is DefinedUseQueryResult<AppData> =>
                            query.isSuccess,
                    )
                    .map(({ data }) => ({
                        id: data.id,
                        type: IntegrationType.App as const,
                        name: actionsAppsById[data.id]?.name || data.name,
                        icon: data.app_icon,
                        installed: data.is_installed,
                    })),
            ].filter((app): app is Extract<App, { type: T }> =>
                types.includes(app.type as T),
            ),
        [appsList, actionsAppsById, appQueries, types],
    )

    const isLoading =
        isInitialLoading ||
        isActionsAppsInitialLoading ||
        appQueries.some((query) => query.isLoading)

    return { isLoading, apps, actionsApps }
}

export default useApps
