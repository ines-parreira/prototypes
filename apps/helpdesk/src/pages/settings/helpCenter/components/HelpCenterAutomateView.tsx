import { ConnectedChannelsHelpCenterView } from 'pages/automate/connectedChannels/legacy/components/ConnectedChannelsHelpCenterView'

import useCurrentHelpCenter from '../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'

import css from './HelpCenterAutomateView.less'

export const HelpCenterAutomateView = () => {
    const helpCenter = useCurrentHelpCenter()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            pageWrapperClassName={css.container}
            fluidContainer={false}
        >
            <ConnectedChannelsHelpCenterView
                helpCenter={helpCenter}
                hideDropdown
            />
        </HelpCenterPageWrapper>
    )
}
