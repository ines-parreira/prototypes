import { HTMLProps, ReactNode } from 'react'

import classnames from 'classnames'

import css from 'pages/common/components/table/TableWrapper.less'

type Props = HTMLProps<HTMLTableElement> & {
    children: ReactNode
    className?: string
    height?: 'comfortable' | 'compact'
}

export default function TableWrapper({
    className,
    children,
    height,
    ...otherProps
}: Props) {
    return (
        <table
            {...otherProps}
            className={classnames(css.table, height && css[height], className)}
        >
            {children}
        </table>
    )
}
