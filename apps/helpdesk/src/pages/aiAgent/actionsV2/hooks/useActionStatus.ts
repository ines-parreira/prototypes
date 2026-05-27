import { useMemo } from 'react'

import { useListActionsApps } from 'models/workflows/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ServiceConnectionsResult } from './useServiceConnections'

export type ActionStatus = 'failed' | 'disabled' | 'enabled'

const STATUS_ORDER: Record<ActionStatus, number> = {
    failed: 0,
    disabled: 1,
    enabled: 2,
}

export const compareActionStatus = (a: ActionStatus, b: ActionStatus) =>
    STATUS_ORDER[a] - STATUS_ORDER[b]

type ActionsApp = ReturnType<typeof useListActionsApps>['data'] extends
    | (infer T)
    | undefined
    ? T
    : never

const getActionStatus = (
    action: StoreWorkflowsConfiguration,
    actionsApps: NonNullable<ActionsApp>,
    serviceConnections: ServiceConnectionsResult,
): ActionStatus => {
    if (!serviceConnections.isError) {
        for (const templateApp of action.apps ?? []) {
            if (templateApp.type !== 'app') continue
            const actionsApp = actionsApps.find(
                (app) => app.id === templateApp.app_id,
            )
            if (!actionsApp || actionsApp.auth_type !== 'trackstar') continue
            const status =
                serviceConnections.byIntegration[
                    actionsApp.auth_settings.integration_name
                ]
            if (status?.isFailed) return 'failed'
        }
    }
    return action.entrypoints[0]?.deactivated_datetime ? 'disabled' : 'enabled'
}

export const useActionStatuses = (
    actions: StoreWorkflowsConfiguration[],
    serviceConnections: ServiceConnectionsResult,
) => {
    const { data: actionsApps = [] } = useListActionsApps()

    return useMemo(() => {
        const map = new Map<string, ActionStatus>()
        for (const action of actions) {
            map.set(
                action.id,
                getActionStatus(action, actionsApps, serviceConnections),
            )
        }
        return map
    }, [actions, actionsApps, serviceConnections])
}
