import { useLocalStorage } from '@repo/hooks'
import { Link } from 'react-router-dom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { CLOSED_MANY_HELP_CENTERS_ALERT_KEY } from '../constants'

import css from './ArticleRecommendationAlerts.less'

export const NoHelpCenterAlert = () => (
    <Alert
        icon
        type={AlertType.Warning}
        customActions={
            <Link to={`/app/settings/help-center`}>Create Help Center</Link>
        }
    >
        Create a help center and add articles to use this feature.
    </Alert>
)

export const ManyHelpCentersAlert = ({
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
}) => {
    const [closedAlerts, setClosedAlerts] = useLocalStorage<string[]>(
        CLOSED_MANY_HELP_CENTERS_ALERT_KEY,
        [],
    )
    const key = `${shopType}:${shopName}`

    if (closedAlerts?.includes(key)) {
        return null
    }

    const handleClose = () => {
        if (!closedAlerts) {
            return
        }

        setClosedAlerts([...closedAlerts, key])
    }

    return (
        <Alert icon type={AlertType.Warning} onClose={handleClose}>
            Make sure the desired Help Center is selected below.
        </Alert>
    )
}

export const EmptyHelpCenterAlert = ({
    helpCenterId,
}: {
    helpCenterId: number
}) => (
    <Alert
        icon
        type={AlertType.Warning}
        customActions={
            <Link to={`/app/settings/help-center/${helpCenterId}/articles`}>
                Go To Help Center
            </Link>
        }
    >
        Add at least one article to this Help Center to use this feature.
    </Alert>
)

export const ConnectedChannelsInfoAlert = ({
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
}) => {
    const isAutomateSettings = useIsAutomateSettings()
    const url = isAutomateSettings
        ? `/app/settings/article-recommendations/${shopType}/${shopName}/channels`
        : `/app/automation/${shopType}/${shopName}/connected-channels`
    return (
        <Alert className={css.alert} icon>
            Control where customers receive article recommendations in{' '}
            <Link
                to={{
                    pathname: url,
                    state: {
                        from: 'article-recommendation',
                    },
                }}
            >
                Channels
            </Link>
            .
        </Alert>
    )
}
