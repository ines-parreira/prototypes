import React, { useMemo } from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { Integration } from 'models/integration/types'
import SourceIcon from 'pages/common/components/SourceIcon'

import css from './ChannelListCell.less'

interface ChannelListCellProps {
    channels: Integration[]
    storeId: number
}

export default function ChannelListCell({
    channels,
    storeId,
}: ChannelListCellProps) {
    const tooltipId = `tooltip-${storeId}`
    const tooltipContent = useMemo(
        () => channels?.map((channel) => channel?.name).join(', '),
        [channels],
    )
    return (
        <>
            <div className={css.container} id={tooltipId}>
                {channels.map((channel) => (
                    <SourceIcon
                        type={channel.type}
                        key={`${storeId}-${channel.name}`}
                        className={css.channelIcon}
                    />
                ))}
            </div>
            <Tooltip target={tooltipId}>{tooltipContent}</Tooltip>
        </>
    )
}
