import classnames from 'classnames'
import React, {ReactNode, useContext} from 'react'

import {ButtonContext} from './Button'
import css from './ButtonIconLabel.less'

export enum ButtonIconPosition {
    Left = 'left',
    Right = 'right',
}

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
    position = ButtonIconPosition.Left,
}: Props) {
    return (
        <span className={classnames(css.wrapper, className)}>
            {position === ButtonIconPosition.Left && (
                <Icon
                    className={classnames(css.icon, css.isLeft, iconClassName)}
                >
                    {icon}
                </Icon>
            )}
            {children}
            {position === ButtonIconPosition.Right && (
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
    const {size} = useContext(ButtonContext)

    return (
        <i className={classnames('material-icons', className, css[size])}>
            {children}
        </i>
    )
}
