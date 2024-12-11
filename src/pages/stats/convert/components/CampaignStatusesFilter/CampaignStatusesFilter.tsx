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
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'pages/stats/common/filters/types'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {DropdownOption} from 'pages/stats/types'
import {getSavedFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'state/ui/stats/filtersSlice'
import {getCleanStatsFiltersWithLogicalOperators} from 'state/ui/stats/selectors'

const filterOptions = [
    {
        options: Object.entries(InferredCampaignStatus).map(([key, value]) => ({
            value: `${value}`,
            label: `${key}`,
        })),
    },
]

const emptyFilter: Exclude<
    StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses],
    undefined
> = withDefaultLogicalOperator([])

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses],
            undefined
        >
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export default function CampaignStatusesFilter({
    value,
    initializeAsOpen,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = _noop,
    dispatchStatFiltersClean = _noop,
    warningType,
    isDisabled,
}: Props) {
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
            dispatchUpdate({
                values,
                operator: value?.operator || LogicalOperatorEnum.ONE_OF,
            })
        },
        [dispatchUpdate, value?.operator]
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
        dispatchRemove()
        onRemove?.()
    }, [dispatchRemove, onRemove])

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.CampaignStatuses, null)
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.CampaignStatuses]}
            filterErrors={{warningType}}
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
            isDisabled={isDisabled}
        />
    )
}

export const CampaignStatusesFilterFromContext = ({
    initializeAsOpen,
    onRemove,
    warningType,
    isDisabled,
}: RemovableFilter & OptionalFilterProps) => {
    const dispatch = useAppDispatch()
    const {selectedCampaignStatuses} = useCampaignStatsFilters()
    const statsFilters = useAppSelector(
        getCleanStatsFiltersWithLogicalOperators
    )
    return (
        <CampaignStatusesFilter
            value={withLogicalOperator(
                selectedCampaignStatuses,
                statsFilters[FilterKey.CampaignStatuses]?.operator
            )}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses]
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaignStatuses: filter,
                    })
                )
            }
            dispatchRemove={() =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaignStatuses: emptyFilter,
                    })
                )
            }
            dispatchStatFiltersDirty={() => dispatch(statFiltersDirty())}
            dispatchStatFiltersClean={() => dispatch(statFiltersClean())}
            warningType={warningType}
            isDisabled={isDisabled}
        />
    )
}

export const CampaignStatusesFilterFromSavedContext = ({
    initializeAsOpen,
    onRemove,
    warningType,
    isDisabled,
}: RemovableFilter & OptionalFilterProps) => {
    const dispatch = useAppDispatch()
    const selectedCampaignStatuses = useAppSelector(
        getSavedFiltersWithLogicalOperators
    )[FilterKey.CampaignStatuses]

    return (
        <CampaignStatusesFilter
            value={selectedCampaignStatuses}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
            warningType={warningType}
            isDisabled={isDisabled}
            dispatchUpdate={(
                filter: Exclude<
                    StatsFiltersWithLogicalOperator[FilterKey.CampaignStatuses],
                    undefined
                >
            ) =>
                dispatch(
                    upsertSavedFilterFilter({
                        operator: filter.operator,
                        values: filter.values.map(String),
                        member: FilterKey.CampaignStatuses,
                    })
                )
            }
            dispatchRemove={() =>
                dispatch(
                    removeFilterFromSavedFilterDraft({
                        filterKey: FilterKey.CampaignStatuses,
                    })
                )
            }
        />
    )
}
