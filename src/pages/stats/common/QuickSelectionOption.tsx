import React from 'react'
import classnames from 'classnames'
import {DropdownItem} from 'reactstrap'

import CheckBox from 'pages/common/forms/CheckBox'

import css from './QuickSelectionOption.less'

type Props = {
    className?: string
    isPartial?: boolean
    onClick: () => void
    selectedItemsCount: number
    totalItemsCount: number
}

const QuickSelectionOption = ({
    className,
    isPartial,
    onClick,
    selectedItemsCount,
    totalItemsCount,
}: Props) => (
    <DropdownItem toggle={false} className={css.component}>
        <CheckBox
            className={css.checkbox}
            labelClassName={className}
            isChecked={!!selectedItemsCount}
            onChange={onClick}
            isIndeterminate={
                !!selectedItemsCount && selectedItemsCount < totalItemsCount
            }
        >
            {selectedItemsCount === 0
                ? `Select ${isPartial ? 'displayed' : 'all'}`
                : selectedItemsCount === 1
                ? 'Deselect'
                : 'Deselect all'}
            <div
                className={classnames(css.badge, {
                    [css['badge--unselect']]: selectedItemsCount > 0,
                })}
            >
                {selectedItemsCount || totalItemsCount}
            </div>
        </CheckBox>
    </DropdownItem>
)

export default QuickSelectionOption
