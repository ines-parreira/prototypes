import classNames from 'classnames'
import { Link } from 'react-router-dom'

import type { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import { ChannelConfig } from './utils'

import css from '../WorkflowsPublisher.less'

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
