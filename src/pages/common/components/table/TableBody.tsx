import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './TableBody.less'

type Props = HTMLProps<HTMLTableSectionElement> & {
    children: ReactNode
    className?: string
}

function TableBody(
    {children, className, ...otherProps}: Props,
    ref: React.Ref<HTMLTableSectionElement> | null | undefined
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

export default React.forwardRef(TableBody)
