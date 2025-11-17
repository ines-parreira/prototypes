import React, { useMemo } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import chatIcon from 'assets/img/icons/channels/chat.svg'
import contactFormIcon from 'assets/img/icons/channels/contact-form.svg'
import emailIcon from 'assets/img/icons/channels/email.svg'
import facebookIcon from 'assets/img/icons/channels/facebook.svg'
import helpCenterIcon from 'assets/img/icons/channels/help-center.svg'
import phoneIcon from 'assets/img/icons/channels/phone.svg'
import smsIcon from 'assets/img/icons/channels/sms.svg'
import tiktokShopIcon from 'assets/img/icons/channels/tiktok-shop.svg'
import whatsappIcon from 'assets/img/icons/channels/whatsapp.svg'
import type { Integration } from 'models/integration/types'

import getDeduplicatedChannelTypes from '../../helpers/getDeduplicatedChannelTypes'
import sortChannels from '../../helpers/sortChannels'

import css from './ChannelListCell.less'

const channelIcons: Record<string, string> = {
    email: emailIcon,
    gorgias_chat: chatIcon,
    'help-center': helpCenterIcon,
    'contact-form': contactFormIcon,
    phone: phoneIcon,
    sms: smsIcon,
    whatsapp: whatsappIcon,
    facebook: facebookIcon,
    'tiktok-shop': tiktokShopIcon,
}

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
                    channelTypes.map((type) => (
                        <img
                            alt={type}
                            key={`${storeId}-${type}`}
                            src={channelIcons[type]}
                        />
                    ))
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
