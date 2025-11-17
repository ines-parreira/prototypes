import type { ForwardedRef } from 'react'
import React, { forwardRef } from 'react'

import classnames from 'classnames'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { ChannelLike } from 'services/channels'
import { isLegacyChannel, toChannel } from 'services/channels'

import css from './SourceIcon.less'

export const AUTOMATE_ICON = 'automate_icon'
export const AI_AGENT_ICON = 'ai_agent_icon'
export const WARNING_ICON = 'warning_icon'
export const ERROR_ICON = 'error_icon'

type Props = {
    type?: ChannelLike
    className?: string
    variant?: 'primary' | 'secondary'
    id?: string
}

const sourceTypeToIcon = (sourceType?: ChannelLike) => {
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
        case TicketMessageSourceType.ContactForm:
        case TicketChannel.ContactForm:
            icon.name = 'email'
            break
        case TicketMessageSourceType.EmailForward:
            icon.name = 'forward'
            break
        case TicketMessageSourceType.Chat:
        case IntegrationType.GorgiasChat:
        case TicketMessageSourceType.ChatContactForm:
        case TicketMessageSourceType.ChatOfflineCapture:
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
            icon.name = 'live_help'
            break
        case TicketChannel.WhatsApp:
        case TicketMessageSourceType.WhatsAppMessage:
            icon.custom = true
            icon.name = 'whatsapp'
            break
        case AUTOMATE_ICON:
            icon.name = 'bolt'
            break
        case AI_AGENT_ICON:
            icon.name = 'auto_awesome'
            break
        case WARNING_ICON:
            icon.name = 'warning'
            break
        case ERROR_ICON:
            icon.name = 'error'
            break
    }

    return icon
}

const SourceIcon = (
    { type, className, variant, ...otherProps }: Props,
    ref: ForwardedRef<HTMLImageElement>,
) => {
    if (type && !isLegacyChannel(type)) {
        const channel = toChannel(type)
        if (channel && channel.logo_url) {
            return (
                <img
                    ref={ref}
                    src={channel.logo_url}
                    alt={channel.name}
                    width="13px"
                    height="13px"
                    className={classnames(
                        'icon source-icon d-inline-block',
                        css.newIcon,
                        { [css.secondary]: variant === 'secondary' },
                        className,
                    )}
                    {...otherProps}
                />
            )
        }
    }

    const icon = sourceTypeToIcon(type)

    return (
        <i
            ref={ref}
            className={classnames(
                'icon source-icon d-inline-block',
                icon.extra,
                {
                    [`icon-custom icon-${icon.name}`]: icon.custom,
                    ['material-icons']: !icon.custom,
                    [css.secondary]: variant === 'secondary',
                },
                className,
            )}
            {...otherProps}
        >
            {!icon.custom && icon.name}
        </i>
    )
}

export default forwardRef(SourceIcon)
