import React from 'react'
import classnames from 'classnames'

import {IntegrationType} from '../../../models/integration/types'
import {SourceType} from '../../../models/ticket/types'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../business/types/ticket'

type Props = {
    type?: SourceType | IntegrationType | TicketChannel
    className?: string
    id?: string
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
        case IntegrationType.Gmail:
        case IntegrationType.Outlook:
        case TicketMessageSourceType.HelpCenterContactForm:
            icon.name = 'email'
            break
        case TicketMessageSourceType.EmailForward:
            icon.name = 'forward'
            break
        case TicketMessageSourceType.Chat:
        case IntegrationType.GorgiasChat:
        case IntegrationType.Smooch:
        case IntegrationType.SmoochInside:
        case TicketMessageSourceType.ChatContactForm:
            icon.name = 'forum'
            break
        case TicketMessageSourceType.Api:
            icon.name = 'code'
            break
        case TicketMessageSourceType.Aircall:
        case TicketMessageSourceType.OttspottCall:
        case TicketMessageSourceType.Phone:
        case TicketMessageSourceType.Twilio:
            icon.name = 'phone'
            break
        case TicketMessageSourceType.Sms:
            icon.name = 'sms'
            break
        case TicketChannel.FacebookMention:
        case TicketMessageSourceType.FacebookComment:
        case TicketMessageSourceType.FacebookReviewComment:
        case TicketMessageSourceType.Facebook:
        case TicketMessageSourceType.FacebookReview:
        case TicketMessageSourceType.FacebookPost:
        case TicketMessageSourceType.FacebookRecommendations:
        case TicketMessageSourceType.FacebookMentionPost:
        case TicketMessageSourceType.FacebookMentionComment:
            icon.custom = true
            icon.name = 'facebook-feed'
            break
        case TicketMessageSourceType.FacebookMessage:
        case TicketMessageSourceType.FacebookMessenger:
            icon.custom = true
            icon.name = 'facebook-messenger'
            break
        case TicketMessageSourceType.SystemMessage:
            icon.name = 'settings'
            break
        case TicketChannel.Twitter:
        case TicketMessageSourceType.TwitterTweet:
        case TicketMessageSourceType.TwitterQuotedTweet:
        case TicketMessageSourceType.TwitterMentionTweet:
            icon.custom = true
            icon.name = 'twitter'
            break
        case TicketMessageSourceType.TwitterDirectMessage:
            icon.custom = true
            icon.name = 'twitter-dm'
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
        case IntegrationType.Yotpo:
        case TicketMessageSourceType.YotpoReview:
            icon.custom = true
            icon.name = 'yotpo-review'
            break
        case TicketMessageSourceType.YotpoReviewPublicComment:
            icon.custom = true
            icon.name = 'yotpo-review-public-comment'
            break
        case TicketMessageSourceType.YotpoReviewPrivateComment:
            icon.custom = true
            icon.name = 'yotpo-review-private-comment'
            break
        case TicketChannel.HelpCenter:
            icon.name = 'help'
            break
        case TicketMessageSourceType.WhatsAppMessage:
            icon.custom = true
            icon.name = 'whatsapp'
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
