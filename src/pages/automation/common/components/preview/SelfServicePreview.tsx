import React from 'react'
import {Router, Switch} from 'react-router-dom'
import {History} from 'history'

import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {TicketChannel} from 'business/types/ticket'

import SelfServiceChatIntegrationPreview from './SelfServiceChatIntegrationPreview'
import SelfServiceHelpCenterPreview from './SelfServiceHelpCenterPreview'

type Props = {
    channel: SelfServiceChannel
    history: History
}

const SelfServicePreview = ({channel, history}: Props) => {
    return (
        <Router history={history}>
            <Switch>
                {channel.type === TicketChannel.Chat && (
                    <SelfServiceChatIntegrationPreview
                        integration={channel.value}
                    />
                )}
                {channel.type === TicketChannel.HelpCenter && (
                    <SelfServiceHelpCenterPreview helpCenter={channel.value} />
                )}
            </Switch>
        </Router>
    )
}

export default SelfServicePreview
