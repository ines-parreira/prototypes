import React, {ComponentProps, forwardRef, Ref} from 'react'
import classnames from 'classnames'

import Button from './Button'
import css from './IconButton.less'

type Props = {
    children?: string
    iconClassName?: string
} & Omit<ComponentProps<typeof Button>, 'children'>

const IconButton = forwardRef(
    (
        {
            children,
            className,
            iconClassName = 'material-icons',
            size = 'medium',
            ...others
        }: Props,
        ref: Ref<HTMLButtonElement> | null | undefined
    ) => {
        return (
            <Button
                className={classnames(className, css.wrapper, css[size])}
                size={size}
                {...others}
                ref={ref}
            >
                <i className={classnames(iconClassName, css.icon)}>
                    {children}
                </i>
            </Button>
        )
    }
)

export default IconButton
