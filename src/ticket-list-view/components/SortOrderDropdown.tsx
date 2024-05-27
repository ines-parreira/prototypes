import React, {useMemo, useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import {LabelWithTooltip} from 'pages/common/components/LabelWithTooltip/LabelWithTooltip'

import {sortOrderOptions, SortOrder} from '../hooks/useSortOrder'
import css from './SortOrderDropdown.less'

type Props = {
    onChange: (sortOrder: SortOrder) => void
    value: SortOrder
}

export default function SortingDropdown({onChange, value}: Props) {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const selectedOption = useMemo(
        () => sortOrderOptions.find((opt) => opt.value === value),
        [value]
    )

    return (
        <SelectInputBox
            ref={targetRef}
            className={css.sortingSelect}
            floating={floatingRef}
            onToggle={setIsOpen}
            label={selectedOption?.label}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        ref={floatingRef}
                        target={targetRef}
                        className={css.dropdown}
                        isOpen={isOpen}
                        onToggle={() => context!.onBlur()}
                        value={value}
                        placement="bottom-end"
                    >
                        <DropdownBody>
                            {sortOrderOptions.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    onClick={onChange}
                                    option={option}
                                    shouldCloseOnSelect
                                >
                                    <LabelWithTooltip
                                        label={option.label}
                                        tooltipText={option.tooltipText}
                                        className={css.sortingLabel}
                                        tooltipProps={{
                                            placement: 'right',
                                            innerProps: {
                                                fade: false,
                                                boundariesElement: 'viewport',
                                            },
                                        }}
                                    />
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
