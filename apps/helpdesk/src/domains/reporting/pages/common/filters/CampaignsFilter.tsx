import React, { useCallback, useMemo } from 'react'

import noop from 'lodash/noop'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { CampaignPreview } from 'models/convert/campaign/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Campaigns]
    campaigns: CampaignPreview[]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Campaigns],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export default function CampaignsFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    campaigns,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    warningType,
    isDisabled,
}: Props) {
    const getSelectedCampaigns = useMemo(() => {
        return campaigns
            .filter((campaign) => value.values.includes(campaign.id))
            .map((campaign) => ({
                label: campaign.name,
                value: campaign.id,
            }))
    }, [value, campaigns])

    const campaignsOptionGroups = useMemo(() => {
        return [
            {
                options: campaigns.map((campaign) => ({
                    label: campaign.name,
                    value: campaign.id,
                })),
            },
        ]
    }, [campaigns])

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = opt.value
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((campaign) => campaign !== id),
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.Campaigns,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Campaigns]}
            filterErrors={{ warningType }}
            selectedOptions={getSelectedCampaigns}
            logicalOperators={[]}
            filterOptionGroups={campaignsOptionGroups}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    campaigns.map((campaign) => campaign.id),
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatchRemove()
                onRemove?.()
            }}
            onChangeLogicalOperator={noop}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            isDisabled={isDisabled}
        />
    )
}

export const CampaignsFilterFromContext = ({
    initializeAsOpen,
    onRemove,
    isDisabled,
    warningType,
}: RemovableFilter & OptionalFilterProps) => {
    const dispatch = useAppDispatch()
    const { campaigns, selectedCampaigns } = useCampaignStatsFilters()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    return (
        <CampaignsFilter
            campaigns={campaigns}
            value={withLogicalOperator(
                selectedCampaigns,
                statsFilters?.[FilterKey.Campaigns]?.operator,
            )}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.Campaigns],
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaigns: filter,
                    }),
                )
            }
            dispatchRemove={() =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaigns: emptyFilter,
                    }),
                )
            }
            dispatchStatFiltersDirty={() => dispatch(statFiltersDirty())}
            dispatchStatFiltersClean={() => dispatch(statFiltersClean())}
            isDisabled={isDisabled}
            warningType={warningType}
        />
    )
}

export const CampaignsFilterFromSavedContext = ({
    initializeAsOpen,
    onRemove,
    isDisabled,
    warningType,
}: RemovableFilter & OptionalFilterProps) => {
    const dispatch = useAppDispatch()
    const { campaigns } = useCampaignStatsFilters()
    const selectedCampaigns = useAppSelector(
        getSavedFiltersWithLogicalOperators,
    )[FilterKey.Campaigns]

    return (
        <CampaignsFilter
            campaigns={campaigns}
            value={selectedCampaigns}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
            isDisabled={isDisabled}
            warningType={warningType}
            dispatchUpdate={(
                filter: Exclude<
                    StatsFiltersWithLogicalOperator[FilterKey.Campaigns],
                    undefined
                >,
            ) =>
                dispatch(
                    upsertSavedFilterFilter({
                        operator: filter.operator,
                        values: filter.values.map(String),
                        member: FilterKey.Campaigns,
                    }),
                )
            }
            dispatchRemove={() =>
                dispatch(
                    removeFilterFromSavedFilterDraft({
                        filterKey: FilterKey.Campaigns,
                    }),
                )
            }
        />
    )
}
