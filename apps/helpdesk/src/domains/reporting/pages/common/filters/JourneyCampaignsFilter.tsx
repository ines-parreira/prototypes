import { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { useJourneyContext } from 'AIJourney/providers'
import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.JourneyCampaigns]
    campaigns: JourneyApiDTO[]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.JourneyCampaigns],
            undefined
        >,
    ) => void
}

function getCampaignLabel(campaign: JourneyApiDTO): string {
    return campaign.campaign?.title ?? 'Untitled'
}

export function filterNonDraftCampaigns(
    campaigns: JourneyApiDTO[],
): JourneyApiDTO[] {
    return campaigns.filter(
        (c) => c.campaign?.state !== JourneyCampaignStateEnum.Draft,
    )
}

export const JourneyCampaignsFilter = ({
    value,
    campaigns,
    dispatchUpdate,
}: Props) => {
    const allIds = useMemo(() => campaigns.map((c) => c.id), [campaigns])
    const currentValue = value ?? {
        operator: LogicalOperatorEnum.ONE_OF,
        values: allIds,
    }

    const filterOptionGroups = useMemo(
        () => [
            {
                options: campaigns.map((campaign) => ({
                    label: getCampaignLabel(campaign),
                    value: campaign.id,
                })),
            },
        ],
        [campaigns],
    )

    const selectedOptions = useMemo(
        () =>
            campaigns
                .filter((c) => currentValue.values.includes(c.id))
                .map((c) => ({
                    label: getCampaignLabel(c),
                    value: c.id,
                })),
        [campaigns, currentValue.values],
    )

    const allSelected = currentValue.values.length === allIds.length

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: currentValue.operator,
            })
        },
        [dispatchUpdate, currentValue.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = opt.value
        if (currentValue.values.includes(id)) {
            handleFilterValuesChange(
                currentValue.values.filter((v) => v !== id),
            )
        } else {
            handleFilterValuesChange([...currentValue.values, id])
        }
    }

    const clientSideFilter = useClientSideFilterSearch(filterOptionGroups)

    return (
        <Filter
            search={clientSideFilter.value}
            filterName={FilterLabels[FilterKey.JourneyCampaigns]}
            displayLabel={allSelected ? 'All Campaigns' : undefined}
            filterOptionGroups={clientSideFilter.result}
            selectedOptions={selectedOptions}
            onSearch={clientSideFilter.onSearch}
            onChangeOption={onOptionChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={() => handleFilterValuesChange(allIds)}
            onRemoveAll={() => handleFilterValuesChange([])}
            isMultiple
            isPersistent
            showQuickSelect
            showSearch
        />
    )
}

export const JourneyCampaignsFilterFromContext = () => {
    const dispatch = useAppDispatch()
    const { campaigns } = useJourneyContext()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    const nonDraftCampaigns = useMemo(
        () => filterNonDraftCampaigns(campaigns ?? []),
        [campaigns],
    )

    if (nonDraftCampaigns.length === 0) return null

    return (
        <JourneyCampaignsFilter
            campaigns={nonDraftCampaigns}
            value={
                statsFilters?.[FilterKey.JourneyCampaigns] ??
                withLogicalOperator(nonDraftCampaigns.map((c) => c.id))
            }
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.JourneyCampaigns],
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        journeyCampaigns: filter,
                    }),
                )
            }
        />
    )
}

export const JourneyCampaignsFilterFromSavedContext = () => null
