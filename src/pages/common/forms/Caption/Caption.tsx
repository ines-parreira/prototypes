import React, {HTMLAttributes, ReactNode} from 'react'
import classnames from 'classnames'

import css from './Caption.less'

type Props = {
    children?: ReactNode
    error?: string | ReactNode
    darken?: boolean
} & HTMLAttributes<HTMLDivElement>

const Caption = ({
    children,
    className,
    darken = false,
    error,
    ...props
}: Props) => (
    <div
        className={classnames(
            css.caption,
            {
                [css.error]: !!error,
                [css.darken]: darken,
            },
            className
        )}
        {...props}
    >
        {error || children}
    </div>
)

export default Caption
