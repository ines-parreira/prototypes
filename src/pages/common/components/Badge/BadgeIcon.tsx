import React, {HTMLAttributes, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BadgeIcon.less'

type Props = {
    className?: string
    icon?: ReactNode
    onClick?: () => void
}

export default function BadgeIcon({
    className,
    icon,
    onClick,
}: Props & HTMLAttributes<HTMLDivElement>) {
    return (
        <span
            className={classNames(css.icon, className, {
                [css.withClick]: !!onClick,
            })}
            onClick={onClick}
        >
            {icon}
        </span>
    )
}
