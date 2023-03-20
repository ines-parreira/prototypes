import React from 'react'

import {Link} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import css from './ArticleRecommendationAlerts.less'

export const NoHelpCenterAlert = () => (
    <Alert
        className={css.warning}
        icon
        type={AlertType.Warning}
        customActions={
            <Link to={`/app/settings/help-center`}>Create Help Center</Link>
        }
    >
        Create a help center and add articles to use this feature.
    </Alert>
)

export const ManyHelpCentersAlert = () => (
    <Alert className={css.warning} icon type={AlertType.Warning}>
        You have more than one Help Center. Make sure the desired Help Center is
        selected below.
    </Alert>
)

export const EmptyHelpCenterAlert = ({
    helpCenterId,
}: {
    helpCenterId: number
}) => (
    <Alert
        className={css.warning}
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
        Control where customers receive article recommendations in{' '}
        <Link to={`/app/automation/${shopType}/${shopName}/connected-channels`}>
            connected channels
        </Link>
        .
    </Alert>
)
