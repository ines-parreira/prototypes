import classnames from 'classnames'
import React, {ForwardedRef, forwardRef, HTMLProps, ReactNode} from 'react'

import css from './TableBody.less'

type Props = HTMLProps<HTMLTableSectionElement> & {
    children: ReactNode
    className?: string
}

function TableBody(
    {children, className, ...otherProps}: Props,
    ref: ForwardedRef<HTMLTableSectionElement>
) {
    return (
        <tbody
            {...otherProps}
            ref={ref}
            className={classnames(css.tableBody, className)}
        >
            {children}
        </tbody>
    )
}

export default forwardRef<HTMLTableSectionElement, Props>(TableBody)
