import React, {
    PropsWithChildren,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import classNames from 'classnames'
import flatMap from 'lodash/flatMap'
import useEffectOnce from 'hooks/useEffectOnce'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import FilterName from 'pages/stats/common/components/Filter/components/FilterName/FilterName'
import FilterValue from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue'
import LogicalOperator from 'pages/stats/common/components/Filter/components/LogicalOperator/LogicalOperator'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
} from 'pages/stats/common/components/Filter/constants'
import {DropdownOption, FilterOptionGroup} from 'pages/stats/types'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import FilterDropdownItemLabel from 'pages/stats/common/components/Filter/components/FilterDropdownItemLabel/FilterDropdownItemLabel'
import css from 'pages/stats/common/components/Filter/Filter.less'

type Props = {
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
    selectedOptions: FilterOptionGroup['options']
    showQuickSelect?: boolean
    showSearch?: boolean
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
    selectedOptions,
    showQuickSelect = true,
    showSearch = true,
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

    return (
        <div className={classNames(css.container, className)}>
            <FilterName name={filterName} />
            <FilterValue
                ref={ref}
                optionsLabels={selectedLabels}
                trailIcon={!isPersistent}
                logicalOperator={selectedLogicalOperator}
                onChange={onToggle}
                onRemove={onRemove}
                pressedState={isDropdownOpen}
            />
            <Dropdown
                isMultiple={isMultiple}
                isOpen={isDropdownOpen}
                onToggle={onToggle}
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
                {showSearch && <DropdownSearch autoFocus onChange={onSearch} />}
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
                    className={classNames({
                        [css.withInfiniteScroll]: !!infiniteScroll,
                    })}
                >
                    {filterOptionGroups.map((filterOption, index) => (
                        <DropdownSection
                            className={classNames({
                                [css.noTitle]: filterOption.title !== undefined,
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
                                        onClick={() => onChangeOption(option)}
                                    >
                                        <FilterDropdownItemLabel
                                            label={option.label}
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
