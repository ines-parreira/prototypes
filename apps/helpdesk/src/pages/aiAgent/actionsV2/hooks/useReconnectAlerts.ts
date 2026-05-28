import { useMemo } from 'react'

import { useGetAppsByIds } from 'models/integration/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ServiceConnectionStatuses } from './useServiceConnectionStatuses'

export type ReconnectAlert = {
    kind: 'reconnect'
    appId: string
    appName: string
    appIcon?: string
}

type Params = {
    actions: StoreWorkflowsConfiguration[]
    serviceConnectionStatuses: ServiceConnectionStatuses
}

const collectAppIds = (actions: StoreWorkflowsConfiguration[]): string[] => {
    const ids = new Set<string>()
    for (const action of actions) {
        for (const templateApp of action.apps ?? []) {
            if (templateApp.type === 'app') {
                ids.add(templateApp.app_id)
            }
        }
    }
    return [...ids]
}

export const useReconnectAlerts = ({
    actions,
    serviceConnectionStatuses,
}: Params): ReconnectAlert[] => {
    const appIds = useMemo(() => collectAppIds(actions), [actions])
    const appQueries = useGetAppsByIds(appIds)

    if (serviceConnectionStatuses.isError) return []

    const alerts: ReconnectAlert[] = []
    for (const query of appQueries) {
        if (!query.isSuccess) continue
        const app = query.data
        const status = serviceConnectionStatuses.byAppId[app.id]
        if (!status?.isBroken) continue
        alerts.push({
            kind: 'reconnect',
            appId: app.id,
            appName: app.name,
            appIcon: app.app_icon,
        })
    }
    return alerts
}
