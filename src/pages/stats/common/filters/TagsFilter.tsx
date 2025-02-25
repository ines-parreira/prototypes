import React, { useCallback } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useTagSearch } from 'hooks/reporting/common/useTagSearch'
import { FilterKey, TagFilter, TagFilterInstanceId } from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    FilterLabels,
    tagsFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import { logSegmentEvent } from 'pages/stats/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'pages/stats/common/filters/types'
import {
    createFilterOptions,
    getFilterError,
} from 'pages/stats/common/filters/utils'
import { DropdownOption } from 'pages/stats/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { statFiltersClean, statFiltersDirty } from 'state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'state/ui/stats/filtersSlice'

type DispatchProps = {
    dispatchUpdate: (value: TagFilter[]) => void
    dispatchRemove: (value: {
        filter?: TagFilter[]
        filterInstanceId?: string
    }) => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
}

type Props = {
    value: TagFilter
    otherValue?: TagFilter
    filterInstanceId?: TagFilterInstanceId
} & DispatchProps &
    RemovableFilter &
    OptionalFilterProps

const emptyTagFilter = (
    filterInstanceId: TagFilterInstanceId,
    excludedOperator: LogicalOperatorEnum | undefined,
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
    warningType: tagsWarningType,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    isDisabled,
}: Props) => {
    const { handleTagsSearch, onLoad, tags, shouldLoadMore, tagsState } =
        useTagSearch()

    const tagOptions = createFilterOptions(value.values, tagsState)

    const options = tags
        .filter((tag) => !otherValue?.values.includes(tag.id))
        .map((tag) => ({
            value: String(tag.id),
            label: tag.name,
        }))

    const stateOptions = Object.values(tagsState)
        .filter((tag) => !!tag)
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
        [dispatchUpdate, otherValue, value.filterInstanceId, value.operator],
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
        [dispatchUpdate, otherValue, value.filterInstanceId, value.values],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = Number(opt.value)
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((tagId) => tagId !== id),
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

    const { warningType, warningMessage } = tagsWarningType
        ? { warningType: tagsWarningType, warningMessage: undefined }
        : getFilterError({
              options: [{ options: [...stateOptions] }],
              selectedOptions: tagOptions,
          })

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Tags]}
            filterErrors={{ warningType, warningMessage }}
            filterOptionGroups={[{ options }]}
            selectedOptions={tagOptions}
            logicalOperators={tagsFilterLogicalOperators.filter(
                (operator) => operator !== otherValue?.operator,
            )}
            selectedLogicalOperator={value.operator}
            onChangeOption={onOptionChange}
            onSearch={handleTagsSearch}
            onSelectAll={() => {
                handleFilterValuesChange(
                    options.map((tag) => Number(tag.value)),
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
                dispatchRemove({
                    filter: tagsToUpdate,
                    filterInstanceId: value?.filterInstanceId,
                })
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
            isDisabled={isDisabled}
        />
    )
}

export const getFilterInstanceProps = (
    filter: TagFilter[] | undefined,
    ownProps: Pick<Props, 'filterInstanceId'>,
) => {
    const tagFilters = filter ?? []
    let currentInstance = tagFilters.find(
        (filter) => filter.filterInstanceId === ownProps.filterInstanceId,
    )
    const otherInstanceId =
        ownProps.filterInstanceId === TagFilterInstanceId.First
            ? TagFilterInstanceId.Second
            : TagFilterInstanceId.First
    const otherInstance = tagFilters.find(
        (filter) => filter.filterInstanceId === otherInstanceId,
    )

    if (tagFilters.length === 0 || !currentInstance) {
        currentInstance = emptyTagFilter(
            ownProps.filterInstanceId ?? TagFilterInstanceId.First,
            otherInstance?.operator,
        )
    }

    return { value: currentInstance, otherValue: otherInstance }
}

export const TagsFilterWithState = connect(
    (state: RootState, ownProps: Pick<Props, 'filterInstanceId'>) =>
        getFilterInstanceProps(
            getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Tags],
            ownProps,
        ),
    {
        dispatchUpdate: (filter: TagFilter[]) =>
            mergeStatsFiltersWithLogicalOperator({
                tags: filter,
            }),
        dispatchRemove: ({
            filter,
        }: {
            filter?: TagFilter[]
            filterInstanceId?: string
        }) =>
            mergeStatsFiltersWithLogicalOperator({
                tags: filter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(TagsFilter)

export const TagsFilterWithSavedState = connect(
    (state: RootState, ownProps: Pick<Props, 'filterInstanceId'>) =>
        getFilterInstanceProps(
            getSavedFiltersWithLogicalOperators(state)[FilterKey.Tags],
            ownProps,
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
        dispatchRemove: ({
            filterInstanceId,
        }: {
            filter?: TagFilter[]
            filterInstanceId?: string
        }) =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.Tags,
                filterInstanceId,
            }),
    },
)(TagsFilter)
