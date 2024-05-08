import React, {forwardRef, useRef, useState} from 'react'
import {CreateSlaPolicyBodyMetricsItemUnit} from '@gorgias/api-types'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {timeUnits} from 'pages/settings/SLAs/config/time'

type TimeUnitSelectBoxProps = {
    value: CreateSlaPolicyBodyMetricsItemUnit | undefined
    onChange: (value: CreateSlaPolicyBodyMetricsItemUnit) => void
}

export default forwardRef<HTMLDivElement, TimeUnitSelectBoxProps>(
    function TimeUnitSelectBox({value, onChange}: TimeUnitSelectBoxProps) {
        const floatingRef = useRef<HTMLDivElement>(null)
        const targetRef = useRef<HTMLDivElement>(null)
        const [isOpen, setIsOpen] = useState(false)

        return (
            <SelectInputBox
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                label={value && timeUnits[value].label}
                placeholder="Select time unit"
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                        >
                            <DropdownBody>
                                {Object.values(timeUnits).map((unit) => {
                                    return (
                                        <DropdownItem
                                            key={unit.label}
                                            option={unit}
                                            onClick={(value) => {
                                                onChange(value)
                                            }}
                                            shouldCloseOnSelect
                                        />
                                    )
                                })}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        )
    }
)
