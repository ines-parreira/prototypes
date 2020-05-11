//@flow
import classnames from 'classnames'
import React, {type Node as ReactNode} from 'react'

import css from './TableHead.less'

type Props = $Exact<{
    ...HTMLTableSectionElement,
    children: ReactNode,
    className?: string,
}>

export default function TableHead({
    children,
    className,
    ...otherProps
}: Props) {
    return (
        <thead
            {...otherProps}
            className={classnames(className)}
        >
            <tr className={css.headerRow}>
                {children}
            </tr>
        </thead>
    )
}
