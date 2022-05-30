import React, {useEffect, useState} from 'react'

import SegmentedOption from './SegmentedOption'

import {SegmentedOptionModel} from './types/SegmentedOptionModel'
import {SegmentedOptionValue} from './types/SegmentedOptionValue'
import {ChangeSegmentedOptionFn} from './types/ChangeSegmentedOptionFn'

import classes from './Segmented.less'

type SegmentedProps = {
    options: SegmentedOptionModel[]
    value: SegmentedOptionValue
    onChange: ChangeSegmentedOptionFn
}

const Segmented = ({
    options = [],
    value,
    onChange,
}: SegmentedProps): JSX.Element => {
    const [checkedOption, setCheckedOption] =
        useState<SegmentedOptionValue>(value)

    useEffect(() => {
        setCheckedOption(value)
    }, [value])

    const handleChangeOption: ChangeSegmentedOptionFn = (event, value) => {
        setCheckedOption(value)
        onChange(event, value)
    }

    return (
        <div role="radiogroup" className={classes.container}>
            {options.map((option) => (
                <SegmentedOption
                    key={option.value}
                    checked={option.value === checkedOption}
                    disabled={option.disabled}
                    label={option.label}
                    value={option.value}
                    onChange={handleChangeOption}
                />
            ))}
        </div>
    )
}

export default Segmented
