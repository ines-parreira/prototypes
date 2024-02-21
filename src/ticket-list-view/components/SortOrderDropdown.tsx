import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo, useRef, useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import {
    oldSortOrderOptions,
    sortOrderOptions,
    SortOrder,
} from '../hooks/useSortOrder'
import css from './SortOrderDropdown.less'

type Props = {
    onChange: (sortOrder: SortOrder) => void
    value: SortOrder
}

export default function SortingDropdown({onChange, value}: Props) {
    const hasUpdatedSortOptions = useFlags()[FeatureFlagKey.STVSortUpdated]
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const sortOptions = useMemo(
        () => (hasUpdatedSortOptions ? sortOrderOptions : oldSortOrderOptions),
        [hasUpdatedSortOptions]
    )

    const selectedOption = useMemo(
        () =>
            // this ugly `as` is needed cause typescript does not realise that
            // sortOrderOptions and oldSortOrderOptions share the same structure.
            // This will be cleaned up when the flag is removed again.
            (
                sortOptions as unknown as {label: string; value: SortOrder}[]
            ).find((opt) => opt.value === value),
        [sortOptions, value]
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
                            {sortOptions.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    onClick={onChange}
                                    option={option}
                                    shouldCloseOnSelect
                                />
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
