import React from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import css from '../WorkflowsPublisher.less'
import {ChannelConfig} from './utils'

const NoChannelsAlert = ({
    channelType,
    showLabel,
}: {
    channelType: SelfServiceChannelType
    showLabel?: boolean
}) => {
    return (
        <div
            className={classNames({
                [css.alertContainer]: showLabel,
            })}
        >
            {showLabel && (
                <div className={css.channelAlertHeader}>
                    {ChannelConfig[channelType].label}
                </div>
            )}
            <Alert className={css.channelAlert} icon type={AlertType.Warning}>
                <Link
                    to={{
                        pathname: ChannelConfig[channelType].settingsUrl,
                        state: {
                            from: 'workflow-editor',
                        },
                    }}
                >
                    {ChannelConfig[channelType].linkText}
                </Link>
                {ChannelConfig[channelType].description}
            </Alert>
        </div>
    )
}

export default NoChannelsAlert
