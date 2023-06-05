import classNames from 'classnames'
import React from 'react'

import css from './Badge.less'

export enum BadgeType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
    Info = 'info',
}

export type BadgeProps = {
    type: BadgeType
    text: string
}

const Badge = ({type, text}: BadgeProps) => {
    return <span className={classNames(css.badge, css[type])}>{text}</span>
}

export default Badge
