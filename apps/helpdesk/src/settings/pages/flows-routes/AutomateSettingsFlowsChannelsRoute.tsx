import { createElement } from 'react'

import { AGENT_ROLE } from 'config/user'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import ConnectedChannelsViewContainer from 'pages/automate/connectedChannels/legacy/ConnectedChannelsViewContainer'
import { rootWithUserRoleRequired } from 'pages/common/utils/withUserRoleRequired'

export function AutomateSettingsChannelsRoute() {
    return (
        <SelfServiceHelpCentersProvider>
            <SelfServiceContactFormsProvider>
                {createElement(
                    rootWithUserRoleRequired(
                        ConnectedChannelsViewContainer,
                        AGENT_ROLE,
                    ),
                )}
            </SelfServiceContactFormsProvider>
        </SelfServiceHelpCentersProvider>
    )
}
