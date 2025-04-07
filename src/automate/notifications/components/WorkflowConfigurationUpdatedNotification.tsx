import { Content, Subtitle } from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'
import { WARNING_ICON } from 'pages/common/components/SourceIcon'

import { getAiAgentNavigationRoutes } from '../../../pages/aiAgent/hooks/useAiAgentNavigation'
import { getLDClient } from '../../../utils/launchDarkly'
import { WorkflowConfigurationUpdatedNotificationPayload } from '../types'

type Props = {
    notification: Notification<WorkflowConfigurationUpdatedNotificationPayload>
} & ContentProps

export default function WorkflowConfigurationUpdatedNotification({
    notification,
    ...props
}: Props) {
    const payload = notification.payload
    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(payload.store_name, flags)
    return (
        <Content
            {...props}
            icon={{ type: WARNING_ICON }}
            title={`Reconnect ${payload.integration_name}`}
            url={routes.actions}
        >
            <Subtitle>
                Your connection with {payload.integration_name} has been
                interrupted. Reconnect to avoid disruptions with Action
                performance.
            </Subtitle>
        </Content>
    )
}
