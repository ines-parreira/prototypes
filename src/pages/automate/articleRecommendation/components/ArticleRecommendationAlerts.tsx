import React from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useLocalStorage} from 'react-use'
import {Link} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {ARTICLE_RECOMMENDATION} from 'pages/automate/common/components/constants'
import {CLOSED_MANY_HELP_CENTERS_ALERT_KEY} from '../constants'

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
        []
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
}) => (
    <Alert className={css.alert} icon>
        Enable {ARTICLE_RECOMMENDATION} in{' '}
        <Link
            to={{
                pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
                state: {
                    from: 'article-recommendation',
                },
            }}
        >
            channels
        </Link>
        .
    </Alert>
)
