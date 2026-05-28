import { useMemo } from 'react'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ServiceConnectionStatuses } from './useServiceConnectionStatuses'

export type ActionStatus = 'failed' | 'disabled' | 'enabled'

const STATUS_ORDER: Record<ActionStatus, number> = {
    failed: 0,
    disabled: 1,
    enabled: 2,
}

export const compareActionStatus = (a: ActionStatus, b: ActionStatus) =>
    STATUS_ORDER[a] - STATUS_ORDER[b]

const getActionStatus = (
    action: StoreWorkflowsConfiguration,
    serviceConnectionStatuses: ServiceConnectionStatuses,
): ActionStatus => {
    if (!serviceConnectionStatuses.isError) {
        for (const templateApp of action.apps ?? []) {
            if (templateApp.type !== 'app') continue
            const status = serviceConnectionStatuses.byAppId[templateApp.app_id]
            if (status?.isBroken) return 'failed'
        }
    }
    return action.entrypoints[0]?.deactivated_datetime ? 'disabled' : 'enabled'
}

export const useActionStatuses = (
    actions: StoreWorkflowsConfiguration[],
    serviceConnectionStatuses: ServiceConnectionStatuses,
) => {
    return useMemo(() => {
        const map = new Map<string, ActionStatus>()
        for (const action of actions) {
            map.set(
                action.id,
                getActionStatus(action, serviceConnectionStatuses),
            )
        }
        return map
    }, [actions, serviceConnectionStatuses])
}
