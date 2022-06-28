import classnames from 'classnames'
import React, {forwardRef, HTMLProps, ReactNode, Ref} from 'react'

import css from './DropdownItemLabel.less'

type Props = {
    caption?: ReactNode
    prefix?: ReactNode
    suffix?: ReactNode
} & Omit<HTMLProps<HTMLDivElement>, 'prefix'>

const DropdownItemLabel = forwardRef(
    (
        {caption, children, className, prefix, suffix, ...other}: Props,
        ref: Ref<HTMLDivElement> | null | undefined
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
                            className={classnames(
                                css.caption,
                                'caption-regular'
                            )}
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
)

export default DropdownItemLabel
