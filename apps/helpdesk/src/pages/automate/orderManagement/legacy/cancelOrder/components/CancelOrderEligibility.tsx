import React, { useRef, useState } from 'react'

import _isEqual from 'lodash/isEqual'

import { CancellationsDropdownOptionsList } from 'models/selfServiceConfiguration/constants'
import type { SelfServiceConfigurationFilter } from 'models/selfServiceConfiguration/types'
import {
    FilterKeyEnum,
    FilterOperatorEnum,
} from 'models/selfServiceConfiguration/types'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './CancelOrderEligibility.less'

type Props = {
    eligibility?: SelfServiceConfigurationFilter
    onChange: (eligibility?: SelfServiceConfigurationFilter) => void
}

const CancelOrderEligibility = ({ eligibility, onChange }: Props) => {
    const [isConditionSelectOpen, setIsConditionSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const handleValueChange = (nextValue: string[]) => {
        onChange({
            key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
            value: nextValue,
            operator: FilterOperatorEnum.ONE_OF,
        })
    }
    const handleDelete = () => {
        onChange()
    }

    const option = CancellationsDropdownOptionsList.find((option) =>
        _isEqual(option.statuses, eligibility?.value),
    )

    return (
        <>
            <div className={css.title}>Eligibility window</div>
            <div>
                Customers can request a cancellation when an order meets the
                following criteria:
            </div>
            <div className={css.conditionContainer}>
                <span className={css.conditionLabel}>Order status is</span>
                <SelectInputBox
                    className={css.conditionSelectInput}
                    placeholder="Select status"
                    floating={floatingRef}
                    label={option?.label}
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
                                value={option?.value}
                            >
                                <DropdownBody>
                                    {CancellationsDropdownOptionsList.map(
                                        (option) => (
                                            <DropdownItem
                                                key={option.value}
                                                option={{
                                                    label: option.label,
                                                    value: option.value,
                                                }}
                                                onClick={() => {
                                                    handleValueChange(
                                                        option.statuses,
                                                    )
                                                }}
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
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        size="small"
                        onClick={handleDelete}
                    >
                        clear
                    </IconButton>
                )}
            </div>
        </>
    )
}

export default CancelOrderEligibility
