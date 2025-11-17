import React, { useRef, useState } from 'react'

import { ReturnsDropdownOptionsList } from 'models/selfServiceConfiguration/constants'
import type { SelfServiceConfigurationFilter } from 'models/selfServiceConfiguration/types'
import { FilterOperatorEnum } from 'models/selfServiceConfiguration/types'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './ReturnOrderEligibility.less'

type Props = {
    eligibility?: SelfServiceConfigurationFilter
    onChange: (eligibility?: SelfServiceConfigurationFilter) => void
}

const ReturnOrderEligibility = ({ eligibility, onChange }: Props) => {
    const [isConditionSelectOpen, setIsConditionSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const handleKeyChange = (nextValue: string) => {
        onChange({
            value: '1',
            operator: FilterOperatorEnum.LESS_THAN,
            ...eligibility,
            key: nextValue,
        })
    }
    const handleValueChange = (nextValue?: number) => {
        onChange({
            ...(eligibility as SelfServiceConfigurationFilter),
            value: nextValue?.toString(10) ?? '1',
        })
    }
    const handleDelete = () => {
        onChange()
    }

    const value = ReturnsDropdownOptionsList.find(
        (option) => option.value === eligibility?.key,
    )?.label

    return (
        <>
            <div className={css.title}>Eligibility window</div>
            <div>
                Customers can request a return when an order meets the following
                criteria:
            </div>
            <div className={css.conditionContainer}>
                <SelectInputBox
                    className={css.conditionSelectInput}
                    placeholder="Select condition"
                    floating={floatingRef}
                    label={value}
                    onToggle={setIsConditionSelectOpen}
                    ref={targetRef}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                isOpen={isConditionSelectOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingRef}
                                target={targetRef}
                                value={eligibility?.key}
                            >
                                <DropdownBody>
                                    {ReturnsDropdownOptionsList.map(
                                        (option) => (
                                            <DropdownItem
                                                key={option.value}
                                                option={{
                                                    label: option.label,
                                                    value: option.value,
                                                }}
                                                onClick={handleKeyChange}
                                                shouldCloseOnSelect
                                            />
                                        ),
                                    )}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
                {eligibility && (
                    <>
                        <span className={css.conditionLabel}>less than</span>
                        <NumberInput
                            className={css.conditionNumberInput}
                            value={
                                parseInt(eligibility.value as string, 10) || 1
                            }
                            onChange={handleValueChange}
                            min={1}
                        />
                        <span className={css.conditionLabel}>day(s) ago</span>
                        <IconButton
                            fillStyle="ghost"
                            intent="destructive"
                            size="small"
                            onClick={handleDelete}
                        >
                            clear
                        </IconButton>
                    </>
                )}
            </div>
        </>
    )
}

export default ReturnOrderEligibility
