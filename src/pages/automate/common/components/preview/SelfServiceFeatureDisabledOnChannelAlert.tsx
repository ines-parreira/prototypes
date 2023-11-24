import React from 'react'
import {Link} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import css from './SelfServiceFeatureDisabledOnChannelAlert.less'

type Props = {
    shopName: string
    shopType: string
}

const SelfServiceFeatureDisabledOnChannelAlert = ({
    shopName,
    shopType,
}: Props) => (
    <Alert className={css.alert} type={AlertType.Warning} icon>
        This feature is currently disabled on this channel. Manage this setting
        in{' '}
        <Link
            to={{
                pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
                state: {from: 'self-service-preview-alert'},
            }}
        >
            channels
        </Link>
        .
    </Alert>
)

export default SelfServiceFeatureDisabledOnChannelAlert
