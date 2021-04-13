import React from 'react'
import classnames from 'classnames'

import {IntegrationType} from '../../../models/integration/types'
import {SourceType} from '../../../models/ticket/types'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../business/types/ticket'

type Props = {
    type?: SourceType
    className?: string
}

const sourceTypeToIcon = (
    sourceType?: SourceType | IntegrationType | TicketChannel
) => {
    const icon = {
        name: 'live_help',
        custom: false,
        extra: '',
    }

    switch (sourceType) {
        case TicketMessageSourceType.InternalNote:
            icon.name = 'note'
            icon.extra = 'text-warning'
            break
        case TicketMessageSourceType.Email:
        case IntegrationType.GmailIntegrationType:
        case IntegrationType.OutlookIntegrationType:
            icon.name = 'email'
            break
        case TicketMessageSourceType.EmailForward:
            icon.name = 'forward'
            break
        case TicketMessageSourceType.Chat:
        case IntegrationType.GorgiasChatIntegrationType:
        case IntegrationType.SmoochIntegrationType:
        case IntegrationType.SmoochInsideIntegrationType:
            icon.name = 'forum'
            icon.extra = 'text-purple'
            break
        case TicketMessageSourceType.Api:
            icon.name = 'code'
            break
        case TicketMessageSourceType.Aircall:
        case TicketMessageSourceType.OttspottCall:
        case TicketMessageSourceType.Phone:
            icon.name = 'phone'
            break
        case TicketMessageSourceType.FacebookComment:
        case TicketMessageSourceType.FacebookReviewComment:
        case TicketMessageSourceType.Facebook:
        case TicketMessageSourceType.FacebookReview:
        case TicketMessageSourceType.FacebookPost:
        case TicketMessageSourceType.FacebookRecommendations:
            icon.custom = true
            icon.name = 'facebook'
            break
        case TicketMessageSourceType.FacebookMessage:
        case TicketMessageSourceType.FacebookMessenger:
            icon.custom = true
            icon.name = 'facebook-messenger'
            break
        case TicketMessageSourceType.SystemMessage:
            icon.name = 'settings'
            break
        case TicketMessageSourceType.Twitter:
            icon.custom = true
            icon.name = 'twitter'
            break
        case TicketMessageSourceType.Instagram:
        case TicketMessageSourceType.InstagramAdComment:
        case TicketMessageSourceType.InstagramAdMedia:
        case TicketMessageSourceType.InstagramComment:
        case TicketMessageSourceType.InstagramMedia:
        case TicketChannel.InstagramMention:
        case TicketMessageSourceType.InstagramMentionMedia:
        case TicketMessageSourceType.InstagramMentionComment:
            icon.custom = true
            icon.name = 'instagram'
            break
        case TicketMessageSourceType.InstagramDirectMessage:
            icon.custom = true
            icon.name = 'instagram-dm'
            break
    }

    return icon
}

const SourceIcon = ({type, className, ...otherProps}: Props) => {
    const icon = sourceTypeToIcon(type)

    return (
        <i
            className={classnames(
                'icon d-inline-block',
                icon.extra,
                {
                    [`icon-custom icon-${icon.name}`]: icon.custom,
                    ['material-icons']: !icon.custom,
                },
                className
            )}
            {...otherProps}
        >
            {!icon.custom && icon.name}
        </i>
    )
}

export default SourceIcon
