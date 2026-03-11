import type { ForwardedRef, ReactNode } from 'react'
import React, { forwardRef, useContext } from 'react'

import classnames from 'classnames'

import { BaseButtonContext } from 'pages/common/components/button/BaseButton'
import css from 'pages/common/components/button/ButtonIconLabel.less'

export type ButtonIconPosition = 'left' | 'right'

type Props = {
    children?: ReactNode
    className?: string
    icon: string
    iconClassName?: string
    position?: ButtonIconPosition
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Button />` from @gorgias/axiom instead, which has built-in icon support.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
function ButtonIconLabel(
    { children, className, icon, iconClassName, position = 'left' }: Props,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    return (
        <span className={classnames(css.wrapper, className)} ref={ref}>
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

export default forwardRef<HTMLButtonElement, Props>(ButtonIconLabel)

type IconProps = {
    className?: string
    children: string
}

function Icon({ children, className }: IconProps) {
    const { size } = useContext(BaseButtonContext)

    return (
        <i className={classnames('material-icons', className, css[size])}>
            {children}
        </i>
    )
}
