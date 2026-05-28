import { useMemo } from 'react'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ReconnectAlert } from './useReconnectAlerts'
import { useReconnectAlerts } from './useReconnectAlerts'
import type { ServiceConnectionStatuses } from './useServiceConnectionStatuses'

export type ActivityAlert = ReconnectAlert

export const ACTIVITY_ALERTS_VISIBLE_LIMIT = 10

type Params = {
    actions: StoreWorkflowsConfiguration[]
    serviceConnectionStatuses: ServiceConnectionStatuses
}

export type ActivityAlertsResult = {
    visible: ActivityAlert[]
    overflowCount: number
}

export const useActivityAlerts = ({
    actions,
    serviceConnectionStatuses,
}: Params): ActivityAlertsResult => {
    const reconnectAlerts = useReconnectAlerts({
        actions,
        serviceConnectionStatuses,
    })

    return useMemo(
        () => ({
            visible: reconnectAlerts.slice(0, ACTIVITY_ALERTS_VISIBLE_LIMIT),
            overflowCount: Math.max(
                0,
                reconnectAlerts.length - ACTIVITY_ALERTS_VISIBLE_LIMIT,
            ),
        }),
        [reconnectAlerts],
    )
}
