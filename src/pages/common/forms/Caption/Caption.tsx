import classnames from 'classnames'
import React, {HTMLAttributes, ReactNode} from 'react'

import css from './Caption.less'

type Props = {
    children?: ReactNode
    error?: string | ReactNode
} & HTMLAttributes<HTMLDivElement>

const Caption = ({children, className, error, ...props}: Props) => (
    <div
        className={classnames(
            css.caption,
            {
                [css.error]: !!error,
            },
            className
        )}
        {...props}
    >
        {error || children}
    </div>
)

export default Caption
