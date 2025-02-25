import React from 'react'

import { Link } from 'react-router-dom'

import useLocalStorage from 'hooks/useLocalStorage'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

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
    return (
        <Alert className={css.alert} icon>
            Control where customers receive article recommendations in{' '}
            <Link
                to={{
                    pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
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
