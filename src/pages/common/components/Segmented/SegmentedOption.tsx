import classNames from 'classnames'
import React, {ChangeEvent} from 'react'

import classes from './SegmentedOption.less'
import {ChangeSegmentedOptionFn} from './types/ChangeSegmentedOptionFn'
import {SegmentedOptionModel} from './types/SegmentedOptionModel'

type SegmentedOptionProps = SegmentedOptionModel & {
    checked?: boolean
    onChange: ChangeSegmentedOptionFn
}

const SegmentedOption = ({
    checked,
    disabled,
    label,
    value,
    onChange,
}: SegmentedOptionProps): JSX.Element => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            return
        }
        onChange(event, value)
    }

    return (
        <label
            className={classNames({
                [classes.badge]: true,
                [classes.checked]: checked,
                [classes.disabled]: disabled,
            })}
        >
            <input
                name={value}
                className={classes.input}
                type="radio"
                disabled={disabled}
                checked={checked}
                onChange={handleChange}
            />
            <div>{label}</div>
        </label>
    )
}

export default SegmentedOption
