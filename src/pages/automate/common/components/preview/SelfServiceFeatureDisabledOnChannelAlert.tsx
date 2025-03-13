import React from 'react'

import { Link } from 'react-router-dom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import css from './SelfServiceFeatureDisabledOnChannelAlert.less'

type Props = {
    shopName: string
    shopType: string
}

const SelfServiceFeatureDisabledOnChannelAlert = ({
    shopName,
    shopType,
}: Props) => {
    const isAutomateSettings = useIsAutomateSettings()
    const url = isAutomateSettings
        ? `/app/settings/article-recommendations/${shopType}/${shopName}/channels`
        : `/app/automation/${shopType}/${shopName}/connected-channels`
    return (
        <Alert className={css.alert} type={AlertType.Warning} icon>
            This feature is currently disabled on this channel. Manage this
            setting in{' '}
            <Link
                to={{
                    pathname: url,
                    state: { from: 'self-service-preview-alert' },
                }}
            >
                channels
            </Link>
            .
        </Alert>
    )
}

export default SelfServiceFeatureDisabledOnChannelAlert
