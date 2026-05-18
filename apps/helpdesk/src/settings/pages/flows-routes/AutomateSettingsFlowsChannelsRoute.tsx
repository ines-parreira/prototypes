import { useMemo } from 'react'

import { AGENT_ROLE } from 'config/user'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import { ConnectedChannelsViewContainer } from 'pages/automate/connectedChannels/ConnectedChannelsViewContainer'
import { rootWithUserRoleRequired } from 'pages/common/utils/withUserRoleRequired'

export function AutomateSettingsChannelsRoute() {
    const ChannelsView = useMemo(
        () =>
            rootWithUserRoleRequired(
                ConnectedChannelsViewContainer,
                AGENT_ROLE,
            ),
        [],
    )

    return (
        <SelfServiceHelpCentersProvider>
            <SelfServiceContactFormsProvider>
                <ChannelsView />
            </SelfServiceContactFormsProvider>
        </SelfServiceHelpCentersProvider>
    )
}
