import React, { ForwardedRef, forwardRef } from 'react'

import classnames from 'classnames'

import Button, { type ButtonProps } from './Button'

import css from './IconButton.less'

type Props = {
    children?: string
    iconClassName?: string
} & Omit<ButtonProps, 'children'>

const BaseIconButton = (
    {
        children,
        className,
        fillStyle,
        iconClassName = 'material-icons',
        size,
        ...others
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>,
) => {
    return (
        <Button
            className={classnames(
                className,
                css.wrapper,
                css[fillStyle || ''],
                css[size || ''],
            )}
            fillStyle={fillStyle}
            size={size}
            {...others}
            ref={ref}
        >
            <i className={classnames(iconClassName, css.icon)}>{children}</i>
        </Button>
    )
}

/**
 * @deprecated This component is being phased out. Please use `IconButton` from `@gorgias/merchant-ui-kit` instead.
 * @date 2024-03-05
 * @type ui-kit-migration
 */
const IconButton = forwardRef<HTMLButtonElement, Props>(BaseIconButton)

export default IconButton
