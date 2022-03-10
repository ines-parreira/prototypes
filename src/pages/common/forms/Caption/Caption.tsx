import React, {HTMLAttributes, ReactNode} from 'react'
import classnames from 'classnames'

import css from './Caption.less'

type Props = {
    children?: ReactNode
    error?: string
} & HTMLAttributes<HTMLDivElement>

const Caption = ({children, className, error, ...props}: Props) => (
    <div
        className={classnames(css.caption, {[css.error]: !!error}, className)}
        {...props}
    >
        {error || children}
    </div>
)

export default Caption
