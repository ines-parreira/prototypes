import noop from 'lodash/noop'
import React, {useCallback} from 'react'

import {connect} from 'react-redux'

import {useTagSearch} from 'hooks/reporting/common/useTagSearch'
import {FilterKey, TagFilter, TagFilterInstanceId} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    FilterLabels,
    tagsFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import {logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {DropdownOption} from 'pages/stats/types'

import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {upsertSavedFilterFilter} from 'state/ui/stats/filtersSlice'

type DispatchProps = {
    dispatchUpdate: (value: TagFilter[]) => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
}

type Props = {
    value: TagFilter
    otherValue?: TagFilter
    filterInstanceId?: TagFilterInstanceId
} & DispatchProps &
    RemovableFilter

const emptyTagFilter = (
    filterInstanceId: TagFilterInstanceId,
    excludedOperator: LogicalOperatorEnum | undefined
) => ({
    operator:
        excludedOperator === LogicalOperatorEnum.ONE_OF
            ? LogicalOperatorEnum.NOT_ONE_OF
            : LogicalOperatorEnum.ONE_OF,
    values: [],
    filterInstanceId,
})

export const TagsFilter = ({
    value,
    otherValue,
    initializeAsOpen = false,
    onRemove,
    dispatchUpdate,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
}: Props) => {
    const {handleTagsSearch, onLoad, tags, shouldLoadMore, tagsState} =
        useTagSearch()

    const selectedOptions = value.values.map((id) => ({
        value: id.toString(),
        label: tagsState[id.toString()].name,
    }))

    const options = tags
        .filter((tag) => !otherValue?.values.includes(tag.id))
        .map((tag) => ({
            value: String(tag.id),
            label: tag.name,
        }))

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            const tagsToUpdate = []
            if (values.length > 0) {
                tagsToUpdate.push({
                    values,
                    operator: value.operator,
                    filterInstanceId: value.filterInstanceId,
                })
            }
            if (otherValue) {
                tagsToUpdate.push(otherValue)
            }

            dispatchUpdate(tagsToUpdate)
        },
        [dispatchUpdate, otherValue, value.filterInstanceId, value.operator]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            const tagsToUpdate = [
                {
                    values: value.values,
                    operator: operator,
                    filterInstanceId: value.filterInstanceId,
                },
            ]
            if (otherValue) {
                tagsToUpdate.push(otherValue)
            }

            dispatchUpdate(tagsToUpdate)
        },
        [dispatchUpdate, otherValue, value.filterInstanceId, value.values]
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = Number(opt.value)
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((tagId) => tagId !== id)
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }
    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.Tags, LogicalOperatorLabel[value.operator])
        handleTagsSearch('')
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Tags]}
            filterOptionGroups={[{options}]}
            selectedOptions={selectedOptions}
            logicalOperators={tagsFilterLogicalOperators.filter(
                (operator) => operator !== otherValue?.operator
            )}
            selectedLogicalOperator={value.operator}
            onChangeOption={onOptionChange}
            onSearch={handleTagsSearch}
            onSelectAll={() => {
                handleFilterValuesChange(
                    options.map((tag) => Number(tag.value))
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                const tagsToUpdate: TagFilter[] = []
                if (otherValue) {
                    tagsToUpdate.push(otherValue)
                }
                dispatchUpdate(tagsToUpdate)
                handleTagsSearch('')
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            infiniteScroll={{
                onLoad,
                shouldLoadMore,
            }}
            initializeAsOpen={initializeAsOpen}
        />
    )
}

export const getFilterInstanceProps = (
    filter: TagFilter[] | undefined,
    ownProps: Pick<Props, 'filterInstanceId'>
) => {
    const tagFilters = filter ?? []
    let currentInstance = tagFilters.find(
        (filter) => filter.filterInstanceId === ownProps.filterInstanceId
    )
    const otherInstanceId =
        ownProps.filterInstanceId === TagFilterInstanceId.First
            ? TagFilterInstanceId.Second
            : TagFilterInstanceId.First
    const otherInstance = tagFilters.find(
        (filter) => filter.filterInstanceId === otherInstanceId
    )

    if (tagFilters.length === 0 || !currentInstance) {
        currentInstance = emptyTagFilter(
            ownProps.filterInstanceId ?? TagFilterInstanceId.First,
            otherInstance?.operator
        )
    }

    return {value: currentInstance, otherValue: otherInstance}
}

export const TagsFilterWithState = connect(
    (state: RootState, ownProps: Pick<Props, 'filterInstanceId'>) =>
        getFilterInstanceProps(
            getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Tags],
            ownProps
        ),
    {
        dispatchUpdate: (filter: TagFilter[]) =>
            mergeStatsFiltersWithLogicalOperator({
                tags: filter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    }
)(TagsFilter)

export const TagsFilterWithSavedState = connect(
    (state: RootState, ownProps: Pick<Props, 'filterInstanceId'>) =>
        getFilterInstanceProps(
            getSavedFiltersWithLogicalOperators(state)[FilterKey.Tags],
            ownProps
        ),
    {
        dispatchUpdate: (filter: TagFilter[]) =>
            upsertSavedFilterFilter({
                member: FilterKey.Tags,
                values: filter.map((f) => ({
                    operator: f.operator,
                    values: f.values.map(String),
                    filterInstanceId: f.filterInstanceId,
                })),
            }),
    }
)(TagsFilter)
