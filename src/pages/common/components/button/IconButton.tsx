import React, {ComponentProps, ForwardedRef, forwardRef} from 'react'
import classnames from 'classnames'

import Button from './Button'
import css from './IconButton.less'

type Props = {
    children?: string
    iconClassName?: string
    ['data-testid']?: string
} & Omit<ComponentProps<typeof Button>, 'children'>

const IconButton = (
    {
        children,
        className,
        fillStyle,
        iconClassName = 'material-icons',
        size,
        ['data-testid']: dataTestId,
        ...others
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>
) => {
    return (
        <Button
            className={classnames(
                className,
                css.wrapper,
                css[fillStyle || ''],
                css[size || '']
            )}
            fillStyle={fillStyle}
            size={size}
            data-testid={dataTestId}
            {...others}
            ref={ref}
        >
            <i className={classnames(iconClassName, css.icon)}>{children}</i>
        </Button>
    )
}

export default forwardRef<HTMLButtonElement, Props>(IconButton)
