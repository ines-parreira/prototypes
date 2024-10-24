import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {InferredCampaignStatus} from 'models/convert/campaign/types'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {DropdownOption} from 'pages/stats/types'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'

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

export default function CampaignStatusesFilter({
    value,
    initializeAsOpen,
    onRemove,
}: Props) {
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

    const onSelectAllFilters = useCallback(() => {
        handleFilterValuesChange(Object.values(InferredCampaignStatus))
    }, [handleFilterValuesChange])

    const onRemoveAllFilters = useCallback(() => {
        handleFilterValuesChange([])
    }, [handleFilterValuesChange])

    const onRemoveCampaignStatuses = useCallback(() => {
        dispatch(
            mergeStatsFiltersWithLogicalOperator({
                campaignStatuses: emptyFilter,
            })
        )
        onRemove?.()
    }, [onRemove, dispatch])

    const handleDropdownOpen = () => {
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.CampaignStatuses, null)
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.CampaignStatuses]}
            filterOptionGroups={filterOptions}
            selectedOptions={selectedOptions}
            onChangeOption={onOptionChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={onSelectAllFilters}
            onRemoveAll={onRemoveAllFilters}
            onRemove={onRemoveCampaignStatuses}
            initializeAsOpen={initializeAsOpen}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export const CampaignStatusesFilterFromContext = ({
    initializeAsOpen,
    onRemove,
}: RemovableFilter) => {
    const {selectedCampaignStatuses} = useCampaignStatsFilters()
    const {cleanStatsFilters: statsFilters} = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone
    )
    return (
        <CampaignStatusesFilter
            value={withLogicalOperator(
                selectedCampaignStatuses,
                statsFilters[FilterKey.CampaignStatuses]?.operator
            )}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
        />
    )
}
