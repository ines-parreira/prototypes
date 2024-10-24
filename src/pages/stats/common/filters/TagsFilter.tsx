import React, {useCallback} from 'react'
import {connect} from 'react-redux'

import {useTagSearch} from 'hooks/reporting/common/useTagSearch'
import useAppDispatch from 'hooks/useAppDispatch'
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
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

type Props = {
    value: TagFilter
    otherValue?: TagFilter
    filterInstanceId?: TagFilterInstanceId
} & RemovableFilter

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
}: Props) => {
    const dispatch = useAppDispatch()
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

            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    tags: tagsToUpdate,
                })
            )
        },
        [dispatch, otherValue, value.filterInstanceId, value.operator]
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

            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    tags: tagsToUpdate,
                })
            )
        },
        [dispatch, otherValue, value.filterInstanceId, value.values]
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
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.Tags, LogicalOperatorLabel[value.operator])
        handleTagsSearch('')
        dispatch(statFiltersClean())
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
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        tags: tagsToUpdate,
                    })
                )
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

export const stateToProps = (
    state: RootState,
    ownProps: Omit<Props, 'value' | 'otherValue'>
) => {
    const tagFilters =
        getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Tags] ?? []
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

export const TagsFilterWithState = connect(stateToProps)(TagsFilter)
