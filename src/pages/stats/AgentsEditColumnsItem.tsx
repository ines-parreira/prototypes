import React from 'react'
import {DropdownItem} from 'reactstrap'
import CheckBox from 'pages/common/forms/CheckBox'
import {HintTooltip} from 'pages/stats/common/HintTooltip'

import css from './AgentsEditColumns.less'

type Props = {
    title: string
    isChecked: boolean
    isIndeterminate?: boolean
    onChange: (value: boolean) => void
    tooltip?: string
    disabled?: boolean
}

export const AgentsEditColumnsItem = ({
    title,
    tooltip,
    isChecked,
    onChange,
    isIndeterminate = false,
    disabled = false,
}: Props) => {
    const handleChange = () => onChange(!isChecked)

    return (
        <DropdownItem
            tag="div"
            className={css.dropdownItem}
            toggle={false}
            disabled={disabled}
        >
            <span className={css.drag}>
                <i className="icon material-icons md-3">drag_indicator</i>
            </span>
            <div onClick={handleChange}>
                <CheckBox
                    isDisabled={disabled}
                    isChecked={isChecked}
                    isIndeterminate={isIndeterminate}
                    onChange={handleChange}
                >
                    {title}
                </CheckBox>
            </div>

            {tooltip && <HintTooltip className={css.tooltip} title={tooltip} />}
        </DropdownItem>
    )
}
