import classNames from 'classnames'
import React from 'react'
import css from './WhatsAppMessageTemplateStatus.less'

export enum StatusIntent {
    Warning = 'warning',
    Success = 'success',
    Neutral = 'neutral',
    Error = 'error',
}

type Props = {
    intent: StatusIntent
    label: string
    className?: string
    id?: string
}

export default function Status(props: Props) {
    const {intent, label, className, id} = props

    return (
        <div
            className={classNames(
                className,
                css.statusLabel,
                'd-flex align-items-center flex-wrap'
            )}
            id={id}
        >
            <div className={classNames(css.statusDot, css[intent])} />
            <div>{label}</div>
        </div>
    )
}
