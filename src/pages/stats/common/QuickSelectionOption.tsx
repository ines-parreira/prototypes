import React from 'react'
import classnames from 'classnames'
import {DropdownItem} from 'reactstrap'

import css from './QuickSelectionOption.less'

type Props = {
    className?: string
    onClick: () => void
    selectedItemsCount: number
    totalItemsCount: number
}

const QuickSelectionOption = ({
    className,
    onClick,
    selectedItemsCount,
    totalItemsCount,
}: Props) => {
    return (
        <DropdownItem
            type="button"
            onClick={onClick}
            className={classnames(css.component, className)}
        >
            <span>
                {selectedItemsCount === 0
                    ? 'Select displayed'
                    : selectedItemsCount === 1
                    ? 'Deselect'
                    : 'Deselect all'}
            </span>
            <div
                className={classnames(css.badge, {
                    [css['badge--unselect']]: selectedItemsCount > 0,
                })}
            >
                {selectedItemsCount || totalItemsCount}
            </div>
        </DropdownItem>
    )
}

export default QuickSelectionOption
