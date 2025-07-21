import React, { ForwardedRef, forwardRef, HTMLProps, ReactNode } from 'react'

import classnames from 'classnames'

import css from './DropdownItemLabel.less'

type Props = {
    caption?: ReactNode
    prefix?: ReactNode
    suffix?: ReactNode
    isDisabled?: boolean
} & Omit<HTMLProps<HTMLDivElement>, 'prefix'>

const DropdownItemLabel = (
    {
        caption,
        children,
        className,
        prefix,
        suffix,
        isDisabled,
        ...other
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    return (
        <div
            className={classnames(css.wrapper, className)}
            ref={ref}
            {...other}
        >
            {prefix && (
                <span className={classnames(css.affix, css.prefix)}>
                    {prefix}
                </span>
            )}

            <span className={css.content}>
                {children}

                {caption && (
                    <div
                        className={classnames(css.caption, 'caption-regular', {
                            [css.disabled]: isDisabled,
                        })}
                    >
                        {caption}
                    </div>
                )}
            </span>

            {suffix && (
                <span className={classnames(css.affix, css.suffix)}>
                    {suffix}
                </span>
            )}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(DropdownItemLabel)
