import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Tag } from '@gorgias/axiom'

import { useListActionsApps } from 'models/workflows/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import type { ServiceConnectionsResult } from '../../hooks/useServiceConnections'

type Props = {
    action: StoreWorkflowsConfiguration
    serviceConnections: ServiceConnectionsResult
    shopName: string
}

const StatusCell = ({ action, serviceConnections, shopName }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const { data: actionsApps = [] } = useListActionsApps()

    const failure = useMemo(() => {
        if (serviceConnections.isError) return null
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
            if (status?.isFailed) {
                return {
                    appId: templateApp.app_id,
                    integration: actionsApp.auth_settings.integration_name,
                }
            }
        }
        return null
    }, [action.apps, actionsApps, serviceConnections])

    if (failure) {
        return (
            <Link
                to={routes.appDetail(failure.appId)}
                onClick={(event) => event.stopPropagation()}
                style={{ textDecoration: 'none' }}
            >
                <Tag color="red" leadingSlot="warning">
                    Failed
                </Tag>
            </Link>
        )
    }

    const isEnabled = !action.entrypoints[0]?.deactivated_datetime

    return isEnabled ? (
        <Tag color="green">Enabled</Tag>
    ) : (
        <Tag color="grey">Disabled</Tag>
    )
}

export default StatusCell
