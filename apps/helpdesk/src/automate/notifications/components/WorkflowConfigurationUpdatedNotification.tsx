import { useQueryClient } from '@tanstack/react-query'

import { Content, Subtitle } from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'
import { WARNING_ICON } from 'pages/common/components/SourceIcon'

import { trackstarDefinitionKeys } from '../../../models/workflows/queries'
import { getAiAgentNavigationRoutes } from '../../../pages/aiAgent/hooks/useAiAgentNavigation'
import { WorkflowConfigurationUpdatedNotificationPayload } from '../types'

type Props = {
    notification: Notification<WorkflowConfigurationUpdatedNotificationPayload>
} & ContentProps

export default function WorkflowConfigurationUpdatedNotification({
    notification,
    ...props
}: Props) {
    const payload = notification.payload
    const routes = getAiAgentNavigationRoutes(payload.store_name)
    const queryClient = useQueryClient()
    return (
        <Content
            {...props}
            url={routes.actions}
            icon={{ type: WARNING_ICON }}
            title={`Reconnect ${payload.integration_name}`}
            onClick={() => {
                queryClient.invalidateQueries({
                    queryKey: trackstarDefinitionKeys.all(),
                })
            }}
        >
            <Subtitle>
                Your connection with {payload.integration_name} has been
                interrupted. Reconnect to avoid disruptions with Action
                performance.
            </Subtitle>
        </Content>
    )
}
