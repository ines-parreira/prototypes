import React from 'react'
import webhooksIcon from 'assets/img/icons/webhooks.svg'
import css from './ActionTypeIcon.less'

type Types = 'custom'
type Props = {
    type: Types
}

const ActionTypeMap: {
    [key in Types]: {
        src: string
        alt: string
        text: string
    }
} = {
    custom: {
        src: webhooksIcon,
        alt: 'Webhooks',
        text: 'Custom',
    },
}

export default function ActionsTypeIcon({type}: Props) {
    const {src, alt, text} = ActionTypeMap[type]
    return (
        <div className={css.container}>
            <img src={src} alt={alt} />
            <p>{text}</p>
        </div>
    )
}
