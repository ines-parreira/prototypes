import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import useCurrentHelpCenter from '../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import { ManageRedirects } from './ManageRedirects'

/**
 * This view is meant to be used only by Gorgias support agents to perform maintenance operations.
 * Our merchants should never see this page.
 */
export const HelpCenterMaintenanceView = () => {
    const helpCenter = useCurrentHelpCenter()

    return (
        <HelpCenterPageWrapper helpCenter={helpCenter}>
            <Alert type={AlertType.Warning} icon>
                {`You're currently on an unlisted page used to perform maintenance
                operations. If you're not an admin, you probably don't want to
                use this page...`}
            </Alert>
            <br />
            <ManageRedirects />
        </HelpCenterPageWrapper>
    )
}
