import React, {PropsWithRef, useMemo} from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import SourceIcon from 'pages/common/components/SourceIcon'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {getChannelBySlug} from 'services/channels'

import {UISLAPolicy} from '../types'

import CellLinkWrapper from './CellLinkWrapper'
import css from './ChannelListCell.less'

const CHANNEL_LIMIT = 5

export default function ChannelListCell({
    policy,
    bodyCellProps,
}: {
    policy: UISLAPolicy
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) {
    const {channels, uuid} = policy
    const hasMoreThanChannelLimit =
        !!channels && channels.length > CHANNEL_LIMIT
    const slicedChannels = useMemo(
        () => (channels || []).slice(0, CHANNEL_LIMIT),
        [channels]
    )

    const tooltipId = `tooltip-${uuid}`
    const tooltipContent = useMemo(
        () =>
            channels
                ?.map((channel) => getChannelBySlug(channel)?.name || channel)
                .join(', '),
        [channels]
    )

    return (
        <BodyCell {...bodyCellProps}>
            <CellLinkWrapper to={`/app/settings/sla/${uuid}`}>
                <div className={css.container} id={tooltipId}>
                    {slicedChannels.map((channel) => (
                        <SourceIcon
                            type={channel}
                            key={`${uuid}-${channel}`}
                            className={css.channelIcon}
                        />
                    ))}
                    {hasMoreThanChannelLimit && (
                        <span className={css.channelSurplus}>
                            +{channels.length - CHANNEL_LIMIT}
                        </span>
                    )}
                </div>
                <Tooltip target={tooltipId}>{tooltipContent}</Tooltip>
            </CellLinkWrapper>
        </BodyCell>
    )
}
