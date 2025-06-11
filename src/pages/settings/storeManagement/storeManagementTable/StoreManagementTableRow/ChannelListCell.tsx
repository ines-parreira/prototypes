import React, { useMemo } from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import tiktokIcon from 'assets/img/icons/tiktok-shop-new.svg'
import { Integration } from 'models/integration/types'
import SourceIcon from 'pages/common/components/SourceIcon'

import getDeduplicatedChannelTypes from '../../helpers/getDeduplicatedChannelTypes'
import sortChannels from '../../helpers/sortChannels'

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

    const sortedChannels = useMemo(() => {
        return sortChannels(channels)
    }, [channels])

    const tooltipContent = useMemo(
        () => sortedChannels?.map((channel) => channel?.name).join(', '),
        [sortedChannels],
    )

    const channelTypes = getDeduplicatedChannelTypes(sortedChannels)

    return (
        <>
            <div className={css.container} id={tooltipId}>
                {channelTypes.length ? (
                    channelTypes.map((type) => {
                        if (type === 'tiktok-shop') {
                            return (
                                <img
                                    alt="TikTok Shop"
                                    key={`${storeId}-${type}`}
                                    src={tiktokIcon}
                                />
                            )
                        }

                        return (
                            <SourceIcon
                                type={type}
                                key={`${storeId}-${type}`}
                                className={css.channelIcon}
                            />
                        )
                    })
                ) : (
                    <span className={css.noChannels}>-</span>
                )}
            </div>
            {tooltipContent && (
                <Tooltip target={tooltipId}>{tooltipContent}</Tooltip>
            )}
        </>
    )
}
