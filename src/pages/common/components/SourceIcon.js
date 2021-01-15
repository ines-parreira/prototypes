// @flow
import React from 'react'

import classnames from 'classnames'

import {
    EMAIL_INTEGRATION_TYPE,
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    GORGIAS_CHAT_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
    SMOOCH_INTEGRATION_TYPE,
} from '../../../constants/integration.ts'

import type {IntegrationType} from '../../../models/integration'
import type {SourceType} from '../../../models/ticket/types'
import {
    AIRCALL_SOURCE,
    API_SOURCE,
    CHAT_SOURCE,
    EMAIL_FORWARD_SOURCE,
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_REVIEW_COMMENT_SOURCE,
    FACEBOOK_MESSAGE_SOURCE,
    FACEBOOK_MESSENGER_SOURCE,
    FACEBOOK_POST_SOURCE,
    FACEBOOK_REVIEW_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
    INSTAGRAM_MEDIA_SOURCE,
    INTERNAL_NOTE_SOURCE,
    OTTSPOTT_CALL_SOURCE,
    PHONE_SOURCE,
    SYSTEM_MESSAGE_SOURCE,
    TWITTER_SOURCE,
} from '../../../config/ticket.ts'

type Props = {
    type?: SourceType,
    className?: string,
}

const sourceTypeToIcon = (sourceType?: SourceType | IntegrationType) => {
    const icon = {
        name: 'live_help',
        custom: false,
        extra: '',
    }

    switch (sourceType) {
        case INTERNAL_NOTE_SOURCE:
            icon.name = 'note'
            icon.extra = 'text-warning'
            break
        case EMAIL_INTEGRATION_TYPE:
        case GMAIL_INTEGRATION_TYPE:
        case OUTLOOK_INTEGRATION_TYPE:
            icon.name = 'email'
            break
        case EMAIL_FORWARD_SOURCE:
            icon.name = 'forward'
            break
        case CHAT_SOURCE:
        case GORGIAS_CHAT_INTEGRATION_TYPE:
        case SMOOCH_INTEGRATION_TYPE:
        case SMOOCH_INSIDE_INTEGRATION_TYPE:
            icon.name = 'forum'
            icon.extra = 'text-purple'
            break
        case API_SOURCE:
            icon.name = 'code'
            break
        case AIRCALL_SOURCE:
        case OTTSPOTT_CALL_SOURCE:
        case PHONE_SOURCE:
            icon.name = 'phone'
            break
        case FACEBOOK_COMMENT_SOURCE:
        case FACEBOOK_REVIEW_COMMENT_SOURCE:
        case FACEBOOK_INTEGRATION_TYPE:
        case FACEBOOK_REVIEW_SOURCE:
        case FACEBOOK_POST_SOURCE:
            icon.custom = true
            icon.name = 'facebook'
            break
        case FACEBOOK_MESSAGE_SOURCE:
        case FACEBOOK_MESSENGER_SOURCE:
            icon.custom = true
            icon.name = 'facebook-messenger'
            break
        case SYSTEM_MESSAGE_SOURCE:
            icon.name = 'settings'
            break
        case TWITTER_SOURCE:
            icon.custom = true
            icon.name = 'twitter'
            break
        case 'instagram':
        case INSTAGRAM_AD_COMMENT_SOURCE:
        case INSTAGRAM_AD_MEDIA_SOURCE:
        case INSTAGRAM_COMMENT_SOURCE:
        case INSTAGRAM_MEDIA_SOURCE:
            icon.custom = true
            icon.name = 'instagram'
            break
    }

    return icon
}

const SourceIcon = (props: Props) => {
    const {type, className, ...allProps} = props
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
            {...allProps}
        >
            {!icon.custom && icon.name}
        </i>
    )
}

export default SourceIcon
