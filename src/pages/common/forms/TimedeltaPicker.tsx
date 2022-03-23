import React, {ComponentProps, useEffect, useMemo} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {
    TIMEDELTA_OPERATOR_DEFAULT_UNIT,
    TIMEDELTA_OPERATOR_DEFAULT_VALUE,
} from 'config'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import GroupItem from 'pages/common/components/layout/GroupItem'
import InputGroup from 'pages/common/forms/input/InputGroup'
import NumberInput from 'pages/common/forms/input/NumberInput'
import {isTimedelta} from 'utils/ast'
import {reportError} from 'utils/errors'

import css from './TimedeltaPicker.less'

type Unit = {
    label: string
    value: string
}

type Props = {
    value: string
    onChange: (value: string) => void
    units?: Array<Unit>
} & Omit<ComponentProps<typeof NumberInput>, 'onChange' | 'value'>

const UNITS = [
    {label: 'minute(s) ago', value: 'm'},
    {label: 'hour(s) ago', value: 'h'},
    {label: 'day(s) ago', value: 'd'},
    {label: 'week(s) ago', value: 'w'},
]

const TimedeltaPicker = ({
    min = 0,
    onChange,
    units = UNITS,
    value = TIMEDELTA_OPERATOR_DEFAULT_VALUE,
    ...otherProps
}: Props) => {
    const quantity = useMemo(
        () => parseInt(value.replace(/[^\d]/g, '')),
        [value]
    )

    const unit = useMemo(
        () =>
            isTimedelta(value)
                ? value.substring(value.length - 1)
                : TIMEDELTA_OPERATOR_DEFAULT_UNIT,
        [value]
    )

    const unitLabel = useMemo(
        () => units.find((u) => u.value === unit)?.label,
        [unit, units]
    )

    useEffect(() => {
        if (!isTimedelta(value)) {
            reportError(
                new Error(`Invalid value provided to TimedeltaPicker: ${value}`)
            )
        }
    }, [value])

    useEffect(() => {
        if (min < 0) {
            reportError(
                new Error(
                    `Invalid min provided to TimedeltaPicker: ${min}, "min" should be positive.`
                )
            )
        }
    }, [min])

    return (
        <InputGroup>
            <NumberInput
                value={quantity}
                onChange={(value) => onChange(`${value!}${unit}`)}
                className={css.numberInput}
                hasControls={false}
                min={min}
                isRequired
                {...otherProps}
            />
            <GroupItem>
                {(appendPosition) => (
                    <UncontrolledDropdown>
                        <DropdownToggle tag="span">
                            <Button
                                intent="secondary"
                                className={css.button}
                                appendPosition={appendPosition}
                            >
                                {unitLabel}
                                <ButtonIconLabel
                                    icon="arrow_drop_down"
                                    position="right"
                                />
                            </Button>
                        </DropdownToggle>
                        <DropdownMenu>
                            {units.map((unit) => (
                                <DropdownItem
                                    key={unit.value}
                                    onClick={() =>
                                        onChange(`${quantity}${unit.value}`)
                                    }
                                >
                                    {unit.label}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </UncontrolledDropdown>
                )}
            </GroupItem>
        </InputGroup>
    )
}

export default TimedeltaPicker
