import classNames from 'classnames'
import React from 'react'
import css from './Status.less'

export enum StatusIntent {
    Warning = 'warning',
    Success = 'success',
    Neutral = 'neutral',
}

type Props = {
    intent: StatusIntent
    label: string
    className?: string
}

export default function Status(props: Props) {
    const {intent, label, className} = props

    return (
        <div
            className={classNames(
                className,
                css.statusLabel,
                'd-flex align-items-center flex-wrap'
            )}
        >
            <div className={classNames(css.statusDot, css[intent])} />
            <div>{label}</div>
        </div>
    )
}
