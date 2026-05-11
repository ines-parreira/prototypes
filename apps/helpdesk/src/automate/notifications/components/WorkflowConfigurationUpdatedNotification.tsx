import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { NotificationFeedItem } from '@repo/notifications'
import { useQueryClient } from '@tanstack/react-query'

import { Icon } from '@gorgias/axiom'

import { Content, Subtitle } from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'
import { WARNING_ICON } from 'pages/common/components/SourceIcon'

import { trackstarDefinitionKeys } from '../../../models/workflows/queries'
import { getAiAgentNavigationRoutes } from '../../../pages/aiAgent/hooks/useAiAgentNavigation'
import type { WorkflowConfigurationUpdatedNotificationPayload } from '../types'

type Props = {
    notification: Notification<WorkflowConfigurationUpdatedNotificationPayload>
} & ContentProps

export default function WorkflowConfigurationUpdatedNotification({
    notification,
    ...props
}: Props) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const payload = notification.payload
    const routes = getAiAgentNavigationRoutes(payload.store_name)
    const queryClient = useQueryClient()

    const handleOnClick = () => {
        queryClient.invalidateQueries({
            queryKey: trackstarDefinitionKeys.all(),
        })
    }

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={<Icon name="warning-triangle" color="orange" />}
                title={`Reconnect ${payload.integration_name}`}
                href={routes.actions}
                onClick={handleOnClick}
            >
                Your connection with {payload.integration_name} has been
                interrupted. Reconnect to avoid disruptions with Action
                performance.
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            url={routes.actions}
            icon={{ type: WARNING_ICON }}
            title={`Reconnect ${payload.integration_name}`}
            onClick={handleOnClick}
        >
            <Subtitle>
                Your connection with {payload.integration_name} has been
                interrupted. Reconnect to avoid disruptions with Action
                performance.
            </Subtitle>
        </Content>
    )
}
