import classnames from 'classnames'
import React, {ReactNode, useContext} from 'react'

import {BaseButtonContext} from './BaseButton'
import css from './ButtonIconLabel.less'

export type ButtonIconPosition = 'left' | 'right'

type Props = {
    children?: ReactNode
    className?: string
    icon: string
    iconClassName?: string
    position?: ButtonIconPosition
}

export default function ButtonIconLabel({
    children,
    className,
    icon,
    iconClassName,
    position = 'left',
}: Props) {
    return (
        <span className={classnames(css.wrapper, className)}>
            {position === 'left' && (
                <Icon
                    className={classnames(css.icon, css.isLeft, iconClassName)}
                >
                    {icon}
                </Icon>
            )}
            {children}
            {position === 'right' && (
                <Icon
                    className={classnames(css.icon, css.isRight, iconClassName)}
                >
                    {icon}
                </Icon>
            )}
        </span>
    )
}

type IconProps = {
    className?: string
    children: string
}

function Icon({children, className}: IconProps) {
    const {size} = useContext(BaseButtonContext)

    return (
        <i className={classnames('material-icons', className, css[size])}>
            {children}
        </i>
    )
}
