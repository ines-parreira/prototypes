import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Tag } from '@gorgias/axiom'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import type { ServiceConnectionStatuses } from '../../hooks/useServiceConnectionStatuses'

type Props = {
    action: StoreWorkflowsConfiguration
    serviceConnectionStatuses: ServiceConnectionStatuses
    shopName: string
}

const StatusCell = ({ action, serviceConnectionStatuses, shopName }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const failedAppId = useMemo(() => {
        if (serviceConnectionStatuses.isError) return null
        for (const templateApp of action.apps ?? []) {
            if (templateApp.type !== 'app') continue
            const status = serviceConnectionStatuses.byAppId[templateApp.app_id]
            if (status?.isBroken) return templateApp.app_id
        }
        return null
    }, [action.apps, serviceConnectionStatuses])

    if (failedAppId) {
        return (
            <Link
                to={routes.appDetail(failedAppId)}
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

export { StatusCell }
