import {DefinedUseQueryResult} from '@tanstack/react-query'
import _keyBy from 'lodash/keyBy'
import {useEffect, useMemo, useState} from 'react'

import {INTEGRATION_TYPE_CONFIG, IntegrationConfig} from 'config'
import {IntegrationType} from 'models/integration/constants'
import {useGetApps, useGetAppsByIds} from 'models/integration/queries'
import {AppData} from 'models/integration/types'
import {assetsUrl} from 'utils'

import {useListActionsApps} from '../../../../models/workflows/queries'
import {App} from '../types'

type NativeAppIntegrationConfig = Omit<IntegrationConfig, 'type' | 'image'> & {
    type: IntegrationType.Shopify | IntegrationType.Recharge
    image: string
}

const NATIVE_APPS_TYPES = [IntegrationType.Shopify, IntegrationType.Recharge]
const NATIVE_APPS: App[] = INTEGRATION_TYPE_CONFIG.filter(
    (integration): integration is NativeAppIntegrationConfig =>
        NATIVE_APPS_TYPES.includes(integration.type)
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
    ] as T[]
) => {
    const {
        data: actionsApps = [],
        isInitialLoading: isActionsAppsInitialLoading,
    } = useListActionsApps()
    const [missingApps, setMissingApps] = useState<string[]>([])

    const {data: appsList = [], isInitialLoading} = useGetApps()
    const appQueries = useGetAppsByIds(missingApps)

    const apps = useMemo<Extract<App, {type: T}>[]>(
        () =>
            [
                ...NATIVE_APPS,
                ...appsList.map((item) => ({
                    id: item.id,
                    type: IntegrationType.App as const,
                    name: item.name,
                    icon: item.app_icon,
                })),
                ...appQueries
                    .filter(
                        (query): query is DefinedUseQueryResult<AppData> =>
                            query.isSuccess
                    )
                    .map(({data}) => ({
                        id: data.id,
                        type: IntegrationType.App as const,
                        name: data.name,
                        icon: data.app_icon,
                    })),
            ].filter((app): app is Extract<App, {type: T}> =>
                types.includes(app.type as T)
            ),
        [appsList, appQueries, types]
    )

    useEffect(() => {
        if (!isInitialLoading) {
            const appById = _keyBy(appsList, 'id')

            setMissingApps(
                actionsApps
                    .filter((actionsApp) => !(actionsApp.id in appById))
                    .map((actionsApp) => actionsApp.id)
            )
        }
    }, [actionsApps, appsList, isInitialLoading])

    const isLoading =
        isInitialLoading ||
        isActionsAppsInitialLoading ||
        appQueries.some((query) => query.isLoading)

    return {isLoading, apps, actionsApps}
}

export default useApps
