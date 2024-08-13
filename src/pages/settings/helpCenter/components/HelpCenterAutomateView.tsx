import React from 'react'
import {ConnectedChannelsHelpCenterView} from 'pages/automate/connectedChannels/components/ConnectedChannelsHelpCenterView'
import useCurrentHelpCenter from '../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import css from './HelpCenterAutomateView.less'

export const HelpCenterAutomateView = () => {
    const helpCenter = useCurrentHelpCenter()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            wrapperClassName={css.container}
        >
            <ConnectedChannelsHelpCenterView
                helpCenter={helpCenter}
                hideDropdown
            />
        </HelpCenterPageWrapper>
    )
}
