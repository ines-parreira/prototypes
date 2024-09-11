import React, {useCallback, useMemo} from 'react'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {emptyFilter} from 'pages/stats/common/filters/helpers'

import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {CampaignPreview} from 'models/convert/campaign/types'
import useAppSelector from 'hooks/useAppSelector'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Campaigns]
    campaigns: CampaignPreview[]
} & RemovableFilter

export default function CampaignsFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    campaigns,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()

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
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaigns: {
                        values,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaigns: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
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
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
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
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaigns: emptyFilter,
                    })
                )
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
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
        />
    )
}
