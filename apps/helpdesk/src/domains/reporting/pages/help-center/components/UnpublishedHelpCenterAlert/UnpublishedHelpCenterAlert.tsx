import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

const HELP_CENTER_SETTINGS_PATH = '/app/settings/help-center'

type UnpublishedHelpCenterAlertProps = {
    helpCenterId: number
}

const UnpublishedHelpCenterAlert = ({
    helpCenterId,
}: UnpublishedHelpCenterAlertProps) => (
    <Alert
        type={AlertType.Info}
        icon
        customActions={
            <Link
                to={`${HELP_CENTER_SETTINGS_PATH}/${helpCenterId}/publish-track`}
            >
                <Button fillStyle="ghost">Manage Help Center</Button>
            </Link>
        }
    >
        Set your Help Center back to live in order to view performance insights.
    </Alert>
)

export default UnpublishedHelpCenterAlert
