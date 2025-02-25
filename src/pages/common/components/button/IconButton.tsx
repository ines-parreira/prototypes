import React, { ForwardedRef, forwardRef } from 'react'

import classnames from 'classnames'

import Button, { type ButtonProps } from './Button'

import css from './IconButton.less'

type Props = {
    children?: string
    iconClassName?: string
} & Omit<ButtonProps, 'children'>

const IconButton = (
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

export default forwardRef<HTMLButtonElement, Props>(IconButton)
