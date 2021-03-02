import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './TableHead.less'

type Props = HTMLProps<HTMLTableSectionElement> & {
    children: ReactNode
    className?: string
}

export default function TableHead({children, className, ...otherProps}: Props) {
    return (
        <thead {...otherProps} className={classnames(className)}>
            <tr className={css.headerRow}>{children}</tr>
        </thead>
    )
}
