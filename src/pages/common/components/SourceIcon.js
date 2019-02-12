// @flow
import React from 'react'
import classnames from 'classnames'

import type {SourceType} from '../../../models/ticketElement/types'

type Props = {
    type?: SourceType,
    className?: string,
}

const sourceTypeToIcon = (sourceType?: SourceType) => {
    const icon = {
        name: 'live_help',
        custom: false,
        extra: ''
    }

    switch (sourceType) {
        case 'internal-note':
            icon.name = 'note'
            icon.extra = 'text-warning'
            break
        case 'email':
        case 'gmail':
            icon.name = 'email'
            break
        case 'email-forward':
            icon.name = 'forward'
            break
        case 'chat':
        case 'smooch':
        case 'smooch_inside':
            icon.name = 'forum'
            icon.extra = 'text-purple'
            break
        case 'api':
            icon.name = 'code'
            break
        case 'aircall':
        case 'phone':
        case 'ottspott-call':
            icon.name = 'phone'
            break
        case 'facebook':
        case 'facebook-post':
        case 'facebook-comment':
            icon.custom = true
            icon.name = 'facebook'
            break
        case 'facebook-messenger':
        case 'facebook-message':
            icon.custom = true
            icon.name = 'facebook-messenger'
            break
        case 'system-message':
            icon.name = 'settings'
            break
        case 'twitter':
            icon.custom = true
            icon.name = 'twitter'
            break
        case 'instagram-media':
        case 'instagram-comment':
        case 'instagram':
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
                className,
            )}
            {...allProps}
        >
            {!icon.custom && icon.name}
        </i>
    )
}

export default SourceIcon

