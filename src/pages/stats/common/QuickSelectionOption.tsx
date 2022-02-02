import React from 'react'
import classnames from 'classnames'
import {DropdownItem} from 'reactstrap'

import CheckBox from 'pages/common/forms/CheckBox'

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
                ? 'Select displayed'
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
