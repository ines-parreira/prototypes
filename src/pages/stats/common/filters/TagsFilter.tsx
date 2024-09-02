import React, {useCallback} from 'react'
import {connect} from 'react-redux'
import {useTagSearch} from 'hooks/reporting/common/useTagSearch'
import {emptyFilter} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {DropdownOption} from 'pages/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {tagsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

const TAGS_FILTER_NAME = 'Tags'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Tags]
} & RemovableFilter

export const TagsFilter = ({
    value = emptyFilter,
    initialiseAsOpen = false,
    onRemove,
}: Props) => {
    const dispatch = useAppDispatch()
    const {handleTagsSearch, onLoad, tags, shouldLoadMore, tagsState} =
        useTagSearch()

    const selectedOptions = value.values.map((id) => ({
        value: id.toString(),
        label: tagsState[id.toString()].name,
    }))

    const options = tags.map((tag) => ({
        value: String(tag.id),
        label: tag.name,
    }))

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    tags: {values, operator: value.operator},
                })
            )
        },
        [dispatch, value.operator]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    tags: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
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
        handleTagsSearch('')
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={TAGS_FILTER_NAME}
            filterOptionGroups={[{options}]}
            selectedOptions={selectedOptions}
            logicalOperators={tagsFilterLogicalOperators}
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
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        tags: emptyFilter,
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
            initialiseAsOpen={initialiseAsOpen}
        />
    )
}

export const TagsFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Tags],
}))(TagsFilter)
