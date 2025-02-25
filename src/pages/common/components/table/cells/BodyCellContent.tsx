import React, { HTMLProps, ReactNode } from 'react'

import classNames from 'classnames'

import css from './BodyCellContent.less'

type Props = HTMLProps<HTMLTableDataCellElement> & {
    children: ReactNode
    className?: string
    justifyContent?: 'left' | 'right' | 'center'
    width?: number | string
    style?: React.CSSProperties
}

const BodyCellContent = ({
    children,
    width,
    className,
    justifyContent,
    style = {},
}: Props) => {
    return (
        <div
            className={classNames(
                css.cellContent,
                justifyContent && css[justifyContent],
                className,
            )}
            style={{ width, ...style }}
        >
            {children}
        </div>
    )
}

export default BodyCellContent
