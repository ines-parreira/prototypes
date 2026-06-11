import type { HTMLProps, ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import css from './TableHead.less'

type Props = HTMLProps<HTMLTableSectionElement> & {
    children: ReactNode
    className?: string
}

export function TableHead({ children, className, ...otherProps }: Props) {
    return (
        <thead {...otherProps} className={classnames(className)}>
            <tr className={css.headerRow}>{children}</tr>
        </thead>
    )
}
