import React, {HTMLProps, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCellContent.less'

type Props = HTMLProps<HTMLTableDataCellElement> & {
    children: ReactNode
    className?: string
    width?: number | string
}

const BodyCellContent = ({children, width, className}: Props) => {
    return (
        <div className={classNames(css.cellContent, className)} style={{width}}>
            {children}
        </div>
    )
}

export default BodyCellContent
