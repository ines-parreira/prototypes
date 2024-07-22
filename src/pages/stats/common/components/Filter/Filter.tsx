import React, {useEffect, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import flatMap from 'lodash/flatMap'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import FilterName from 'pages/stats/common/components/Filter/components/FilterName/FilterName'
import FilterValue from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue'
import LogicalOperator from 'pages/stats/common/components/Filter/components/LogicalOperator/LogicalOperator'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {DropdownOption, FilterOptionGroup} from 'pages/stats/types'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import FilterDropdownItemLabel from 'pages/stats/common/components/Filter/components/FilterDropdownItemLabel/FilterDropdownItemLabel'
import css from 'pages/stats/common/components/Filter/Filter.less'

type Props = {
    filterName: string
    filterOptionGroups: FilterOptionGroup[]
    selectedOptions: FilterOptionGroup['options']
    selectedLogicalOperator?: LogicalOperatorEnum | null
    logicalOperators: LogicalOperatorEnum[]
    showQuickSelect?: boolean
    showSearch?: boolean
    isMultiple?: boolean
    isPersistent?: boolean
    className?: string
    onRemove?: () => void
    onChangeOption: (option: DropdownOption) => void
    onSelectAll: () => void
    onRemoveAll: () => void
    onChangeLogicalOperator: (operator: LogicalOperatorEnum) => void
    onDropdownOpen?: () => void
    onDropdownClosed?: () => void
}

const Filter = ({
    filterName,
    selectedOptions,
    filterOptionGroups,
    logicalOperators,
    showQuickSelect = true,
    showSearch = true,
    isMultiple = true,
    selectedLogicalOperator = null,
    isPersistent = false,
    className,
    onRemove,
    onChangeOption,
    onSelectAll,
    onRemoveAll,
    onChangeLogicalOperator,
    onDropdownOpen = () => {},
    onDropdownClosed = () => {},
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const onOpenDropdown = () => {
        onDropdownOpen()
        setIsDropdownOpen(true)
    }

    const allValues = useMemo(() => {
        return flatMap(filterOptionGroups, (option) =>
            option.options.map((option) => option.label)
        )
    }, [filterOptionGroups])

    const {selectedValues, selectedLabels} = useMemo(() => {
        const values: string[] = []
        const labels: string[] = []
        selectedOptions.forEach((option) => {
            values.push(option.value)
            labels.push(option.label)
        })
        return {selectedValues: values, selectedLabels: labels}
    }, [selectedOptions])

    useEffect(() => {
        if (!isDropdownOpen) {
            onDropdownClosed()
        }
    }, [isDropdownOpen, onDropdownClosed])

    return (
        <div className={classNames(css.container, className)}>
            <FilterName name={filterName} />
            <FilterValue
                ref={ref}
                optionsLabels={selectedLabels}
                trailIcon={!isPersistent}
                logicalOperator={selectedLogicalOperator}
                onChange={onOpenDropdown}
                onRemove={onRemove}
                pressedState={isDropdownOpen}
            />
            <Dropdown
                isMultiple={isMultiple}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                target={ref}
                value={selectedValues}
                className={css.dropdown}
            >
                {logicalOperators.length > 0 && (
                    <LogicalOperator
                        selectedLogicalOperator={selectedLogicalOperator}
                        logicalOperators={logicalOperators}
                        onChange={onChangeLogicalOperator}
                    />
                )}
                {showSearch && <DropdownSearch autoFocus />}
                {showQuickSelect && (
                    <DropdownQuickSelect
                        addLabel="Select all"
                        removeLabel="Deselect all"
                        onRemoveAll={onRemoveAll}
                        onSelectAll={onSelectAll}
                        values={allValues}
                        count={allValues.length}
                    />
                )}
                <DropdownBody>
                    {filterOptionGroups.map((filterOption, index) => (
                        <DropdownSection
                            key={filterOption.title || `section_${index}`}
                            title={filterOption.title}
                        >
                            {filterOption.options.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    option={{
                                        label: option.label,
                                        value: option.value,
                                    }}
                                    onClick={() => onChangeOption(option)}
                                >
                                    <FilterDropdownItemLabel
                                        label={option.label}
                                    />
                                </DropdownItem>
                            ))}
                        </DropdownSection>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export default Filter
