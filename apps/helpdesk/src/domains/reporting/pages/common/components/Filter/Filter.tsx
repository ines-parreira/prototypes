import type { PropsWithChildren } from 'react'
import React, { useCallback, useMemo, useRef, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import classNames from 'classnames'
import flatMap from 'lodash/flatMap'

import FilterDropdownItemLabel from 'domains/reporting/pages/common/components/Filter/components/FilterDropdownItemLabel/FilterDropdownItemLabel'
import { FilterWarningIcon } from 'domains/reporting/pages/common/components/Filter/components/FilterWarning/FilterWarningIcon'
import LogicalOperator from 'domains/reporting/pages/common/components/Filter/components/LogicalOperator/LogicalOperator'
import cssLogicalOperator from 'domains/reporting/pages/common/components/Filter/components/LogicalOperator/LogicalOperator.less'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    FILTER_CLEAR_ICON,
    FILTER_DESELECT_ALL_LABEL,
    FILTER_NAME_MAX_WIDTH,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_MAX_WIDTH,
    LogicalOperatorLabel,
    REMOVE_FILTER_LABEL,
} from 'domains/reporting/pages/common/components/Filter/constants'
import css from 'domains/reporting/pages/common/components/Filter/Filter.less'
import type { FilterOptionWithOptionalLabel } from 'domains/reporting/pages/common/filters/utils'
import {
    filterValidOptions,
    getFilterError,
} from 'domains/reporting/pages/common/filters/utils'
import type {
    DropdownOption,
    FilterOptionGroup,
} from 'domains/reporting/pages/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import FilterName from 'pages/common/forms/FilterInput/FilterName'
import FilterValue from 'pages/common/forms/FilterInput/FilterValue'

type Props = {
    search?: string
    className?: string
    filterName: string
    filterOptionGroups: FilterOptionGroup[]
    infiniteScroll?: {
        onLoad: () => Promise<any>
        shouldLoadMore: boolean
    }
    initializeAsOpen?: boolean
    isMultiple?: boolean
    isPersistent?: boolean
    logicalOperators: LogicalOperatorEnum[]
    onChangeLogicalOperator: (operator: LogicalOperatorEnum) => void
    onChangeOption: (option: DropdownOption) => void
    onDropdownClosed?: () => void
    onDropdownOpen?: () => void
    onRemove?: () => void
    onRemoveAll: () => void
    onSearch?: (search: string) => void
    onSelectAll: () => void
    selectedLogicalOperator?: LogicalOperatorEnum | null
    selectedOptions: FilterOptionWithOptionalLabel[]
    showQuickSelect?: boolean
    showSearch?: boolean
    filterErrors?: {
        warningType?: 'not-applicable' | 'non-existent'
        warningMessage?: string
    }
    displayLabel?: string
    isDisabled?: boolean
    shouldCloseOnSelect?: boolean
}

type WithInfiniteScrollProps = PropsWithChildren<{
    infiniteScroll?: {
        onLoad: () => Promise<any>
        shouldLoadMore: boolean
    }
    className?: string
}>

const WithInfiniteScroll = ({
    className,
    infiniteScroll,
    children,
}: WithInfiniteScrollProps) => {
    return infiniteScroll ? (
        <InfiniteScroll
            onLoad={infiniteScroll.onLoad}
            shouldLoadMore={infiniteScroll.shouldLoadMore}
            className={className}
        >
            {children}
        </InfiniteScroll>
    ) : (
        <>{children}</>
    )
}

const Filter = ({
    search,
    className,
    filterName,
    filterOptionGroups,
    infiniteScroll,
    initializeAsOpen = false,
    isMultiple = true,
    isPersistent = false,
    logicalOperators,
    onChangeLogicalOperator,
    onChangeOption,
    onDropdownClosed = () => {},
    onDropdownOpen = () => {},
    onRemove,
    onRemoveAll,
    onSearch,
    onSelectAll,
    selectedLogicalOperator = null,
    selectedOptions: selectedPartialOptions,
    showQuickSelect = true,
    showSearch = true,
    displayLabel,
    filterErrors,
    isDisabled,
    shouldCloseOnSelect,
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(initializeAsOpen)

    useEffectOnce(() => {
        if (initializeAsOpen) {
            onDropdownOpen()
        }
    })

    const onToggle = useCallback(() => {
        if (!isDropdownOpen) {
            onDropdownOpen()
        } else {
            onDropdownClosed()
        }
        setIsDropdownOpen(!isDropdownOpen)
    }, [isDropdownOpen, onDropdownClosed, onDropdownOpen])

    const allValues = useMemo(() => {
        return flatMap(filterOptionGroups, (option) =>
            option.options.map((option) => option.label),
        )
    }, [filterOptionGroups])

    const selectedOptions = filterValidOptions(selectedPartialOptions)

    const { selectedValues, selectedLabels } = useMemo(() => {
        const values: string[] = []
        const labels: string[] = []
        selectedOptions.forEach((option) => {
            values.push(option.value)
            labels.push(option.label)
        })
        return { selectedValues: values, selectedLabels: labels }
    }, [selectedOptions])

    const { warningType, warningMessage } =
        filterErrors ||
        getFilterError({
            options: filterOptionGroups,
            selectedOptions,
        })

    return (
        <div className={classNames(css.container, className)}>
            <FilterName
                name={filterName}
                warning={
                    warningType && (
                        <FilterWarningIcon
                            warningType={warningType}
                            tooltip={
                                warningMessage ||
                                getWarningTooltip(warningType, filterName)
                            }
                        />
                    )
                }
                isDisabled={isDisabled}
                maxWidth={FILTER_NAME_MAX_WIDTH}
            />
            <FilterValue
                ref={ref}
                optionsLabels={displayLabel ? [displayLabel] : selectedLabels}
                trailIcon={!isPersistent ? FILTER_CLEAR_ICON : undefined}
                trailIconTooltipText={REMOVE_FILTER_LABEL}
                onTrailIconClick={onRemove}
                prefix={
                    selectedLogicalOperator && (
                        <div
                            className={cssLogicalOperator.logicalOperator}
                            data-testid="logical-operator"
                        >
                            {LogicalOperatorLabel[selectedLogicalOperator]}
                        </div>
                    )
                }
                onClick={onToggle}
                pressedState={isDropdownOpen}
                isDisabled={isDisabled}
                maxWidth={FILTER_VALUE_MAX_WIDTH}
            />
            <Dropdown
                isMultiple={isMultiple}
                isOpen={isDropdownOpen}
                onToggle={onToggle}
                target={ref}
                value={selectedValues}
                className={css.dropdown}
                isDisabled={isDisabled}
            >
                {logicalOperators.length > 0 && (
                    <LogicalOperator
                        selectedLogicalOperator={selectedLogicalOperator}
                        logicalOperators={logicalOperators}
                        onChange={onChangeLogicalOperator}
                    />
                )}
                {showSearch && (
                    <DropdownSearch
                        autoFocus
                        value={search}
                        onChange={onSearch}
                    />
                )}
                {showQuickSelect && (
                    <DropdownQuickSelect
                        addLabel={FILTER_SELECT_ALL_LABEL}
                        removeLabel={FILTER_DESELECT_ALL_LABEL}
                        onRemoveAll={onRemoveAll}
                        onSelectAll={onSelectAll}
                        values={allValues}
                        count={allValues.length}
                    />
                )}
                <DropdownBody
                    key={`option_${filterOptionGroups[0]?.options?.length || 0}`}
                    className={classNames({
                        [css.withInfiniteScroll]: !!infiniteScroll,
                    })}
                >
                    {filterOptionGroups.map((filterOption, index) => (
                        <DropdownSection
                            className={classNames({
                                [css.noTitle]: filterOption.title === undefined,
                            })}
                            key={filterOption.title || `section_${index}`}
                            title={filterOption.title}
                        >
                            <WithInfiniteScroll
                                infiniteScroll={infiniteScroll}
                                className={css.infiniteScroll}
                            >
                                {filterOption.options.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        option={{
                                            label: option.label,
                                            value: option.value,
                                        }}
                                        onClick={() => {
                                            onChangeOption(option)
                                            if (shouldCloseOnSelect) {
                                                setIsDropdownOpen(false)
                                                onDropdownClosed()
                                            }
                                        }}
                                    >
                                        <FilterDropdownItemLabel
                                            label={option.label}
                                            icon={option.icon}
                                        />
                                    </DropdownItem>
                                ))}
                            </WithInfiniteScroll>
                        </DropdownSection>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export default Filter

export function getWarningTooltip(
    warningType: 'non-existent' | 'not-applicable',
    filterName: string,
) {
    if (warningType === 'non-existent') {
        return 'Some filters or values have been archived or deleted. They will be ignored. Check your settings and update your Saved Filters.'
    }
    return `${filterName} filter is not applicable to this report.`
}
