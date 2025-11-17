import React, { useMemo } from 'react'

import type { History } from 'history'
import _uniqueId from 'lodash/uniqueId'
import { Router, Switch } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

import SelfServiceChatIntegrationPreview from './SelfServiceChatIntegrationPreview'
import SelfServiceHelpCenterPreview from './SelfServiceHelpCenterPreview'
import SelfServiceStandaloneContactFormPreview from './SelfServiceStandaloneContactFormPreview'

type Props = {
    channel: SelfServiceChannel
    history: History
}

const SelfServicePreview = ({ channel, history }: Props) => {
    // Router `history` prop cannot be updated, so we need to change key to force rerender if `history` is different.
    //
    // https://github.com/remix-run/react-router/blob/v5.3.4/packages/react-router/modules/Router.js#L95
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const key = useMemo(() => _uniqueId(), [history])

    return (
        <Router key={key} history={history}>
            <Switch>
                {channel.type === TicketChannel.Chat && (
                    <SelfServiceChatIntegrationPreview
                        integration={channel.value}
                    />
                )}
                {channel.type === TicketChannel.HelpCenter && (
                    <SelfServiceHelpCenterPreview helpCenter={channel.value} />
                )}
                {channel.type === TicketChannel.ContactForm && (
                    <SelfServiceStandaloneContactFormPreview
                        contactForm={channel.value}
                    />
                )}
            </Switch>
        </Router>
    )
}

export default SelfServicePreview
