import noop from 'lodash/noop'

import React, {useCallback, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'

import useAppSelector from 'hooks/useAppSelector'
import {CampaignPreview} from 'models/convert/campaign/types'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorLabel} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {DropdownOption} from 'pages/stats/types'

import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {upsertSavedFilterFilter} from 'state/ui/stats/filtersSlice'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Campaigns]
    campaigns: CampaignPreview[]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Campaigns],
            undefined
        >
    ) => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter

export default function CampaignsFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    campaigns,
    onRemove,
    dispatchUpdate,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
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
        [dispatchUpdate, value.operator]
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = opt.value
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((campaign) => campaign !== id)
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
            LogicalOperatorLabel[value.operator]
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Campaigns]}
            selectedOptions={getSelectedCampaigns}
            logicalOperators={[]}
            filterOptionGroups={campaignsOptionGroups}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    campaigns.map((campaign) => campaign.id)
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatchUpdate(emptyFilter)
                onRemove?.()
            }}
            onChangeLogicalOperator={noop}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
        />
    )
}

export const CampaignsFilterFromContext = ({
    initializeAsOpen,
    onRemove,
}: RemovableFilter) => {
    const dispatch = useAppDispatch()
    const {campaigns, selectedCampaigns} = useCampaignStatsFilters()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    return (
        <CampaignsFilter
            campaigns={campaigns}
            value={withLogicalOperator(
                selectedCampaigns,
                statsFilters?.[FilterKey.Campaigns]?.operator
            )}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.Campaigns]
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaigns: filter,
                    })
                )
            }
            dispatchStatFiltersDirty={() => dispatch(statFiltersDirty())}
            dispatchStatFiltersClean={() => dispatch(statFiltersClean())}
        />
    )
}

export const CampaignsFilterFromSavedContext = ({
    initializeAsOpen,
    onRemove,
}: RemovableFilter) => {
    const dispatch = useAppDispatch()
    const {campaigns} = useCampaignStatsFilters()
    const selectedCampaigns = useAppSelector(
        getSavedFiltersWithLogicalOperators
    )[FilterKey.Campaigns]

    return (
        <CampaignsFilter
            campaigns={campaigns}
            value={selectedCampaigns}
            initializeAsOpen={initializeAsOpen}
            onRemove={onRemove}
            dispatchUpdate={(
                filter: Exclude<
                    StatsFiltersWithLogicalOperator[FilterKey.Campaigns],
                    undefined
                >
            ) =>
                dispatch(
                    upsertSavedFilterFilter({
                        operator: filter.operator,
                        values: filter.values.map(String),
                        member: FilterKey.Campaigns,
                    })
                )
            }
        />
    )
}
