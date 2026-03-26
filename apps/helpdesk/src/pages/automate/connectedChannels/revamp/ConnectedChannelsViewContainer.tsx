import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { ConnectedChannelsChatView } from 'pages/automate/connectedChannels/revamp/components/ConnectedChannelsChatView/ConnectedChannelsChatView'

export const ConnectedChannelsViewContainerRevamp = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/connected-channels" />
    }

    return <ConnectedChannelsChatView />
}
