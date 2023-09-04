import React, {MouseEvent, ReactNode} from 'react'
import classnames from 'classnames'

import css from './EdgeLabel.less'

type Props = {
    children: ReactNode
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    isSelected?: boolean
}

const EdgeLabel = ({children, onClick, isSelected}: Props) => {
    return (
        <div
            className={classnames(css.container, {
                [css.isSelected]: isSelected,
            })}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export default EdgeLabel
