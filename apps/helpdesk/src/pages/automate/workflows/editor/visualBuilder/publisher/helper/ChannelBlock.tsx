import type { ReactNode } from 'react'
import React from 'react'

import type { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'

import { ChannelConfig } from './utils'

import css from '../WorkflowsPublisher.less'

const ChannelBlock = ({
    children,
    channelType,
}: {
    children: ReactNode
    channelType: SelfServiceChannelType
}) => {
    return (
        <div className={css.channelContainer}>
            <div className={css.channelsView}>
                <div className={css.channelSection}>
                    <div className={css.channelHeader}>
                        {ChannelConfig[channelType].label}
                    </div>
                    {children}
                </div>
                <div className={css.chanelPreview}>
                    <img
                        src={ChannelConfig[channelType].assetsUrl}
                        alt="Feature preview"
                        className="img-fluid"
                    />
                    <div className={css.previewDescription}>
                        Example: Flows visible in{' '}
                        {ChannelConfig[channelType].label}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChannelBlock
