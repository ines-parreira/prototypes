import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import {
    campaignStatusesFilterLogicalOperators,
    FilterLabels,
} from 'pages/stats/common/filters/constants'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import Filter from 'pages/stats/common/components/Filter'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {DropdownOption} from 'pages/stats/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {InferredCampaignStatus} from 'models/convert/campaign/types'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {RootState} from 'state/types'

const filterOptions = [
    {
        options: Object.entries(InferredCampaignStatus).map(([key, value]) => ({
            value: `${value}`,
            label: `${key}`,
        })),
    },
]

const emptyFilter: StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses] =
    withDefaultLogicalOperator()

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses]
} & RemovableFilter

export default function CampaignStatusesFilter({value, onRemove}: Props) {
    const dispatch = useAppDispatch()

    const selectedCampaignStatuses = useMemo(
        () => value?.values || [],
        [value?.values]
    )

    const selectedOptions: DropdownOption[] = useMemo(
        () =>
            selectedCampaignStatuses.map((status) => ({
                label: status,
                value: status,
            })) ?? [],
        [selectedCampaignStatuses]
    )

    const handleFilterValuesChange = useCallback(
        (values) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaignStatuses: {
                        values,
                        operator: value?.operator || LogicalOperatorEnum.ONE_OF,
                    },
                })
            )
        },
        [dispatch, value?.operator]
    )

    const onOptionChange = useCallback(
        (option: DropdownOption) => {
            if (selectedCampaignStatuses.includes(option.value)) {
                handleFilterValuesChange(
                    selectedCampaignStatuses.filter(
                        (status) => status !== option.value
                    )
                )
            } else {
                handleFilterValuesChange([
                    ...selectedCampaignStatuses,
                    option.value,
                ])
            }
        },
        [handleFilterValuesChange, selectedCampaignStatuses]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaignStatuses: {
                        values: selectedCampaignStatuses,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, selectedCampaignStatuses]
    )

    const onSelectAllFilters = useCallback(() => {
        handleFilterValuesChange(Object.values(InferredCampaignStatus))
    }, [handleFilterValuesChange])

    const onRemoveAllFilters = useCallback(() => {
        handleFilterValuesChange([])
    }, [handleFilterValuesChange])

    const onRemoveCompaignStatuses = useCallback(() => {
        dispatch(
            mergeStatsFiltersWithLogicalOperator({
                campaignStatuses: emptyFilter,
            })
        )
        onRemove?.()
    }, [onRemove, dispatch])

    return (
        <Filter
            filterName={FilterLabels[FilterKey.CampaignStatuses]}
            filterOptionGroups={filterOptions}
            selectedOptions={selectedOptions}
            onChangeOption={onOptionChange}
            logicalOperators={campaignStatusesFilterLogicalOperators}
            selectedLogicalOperator={value?.operator}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onSelectAll={onSelectAllFilters}
            onRemoveAll={onRemoveAllFilters}
            onRemove={onRemoveCompaignStatuses}
        />
    )
}

export const CampaignStatusesFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[
        FilterKey.CampaignStatuses
    ],
}))(CampaignStatusesFilter)
