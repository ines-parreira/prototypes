import { useCallback, useMemo } from 'react'

import {
    ListSection,
    MultiSelect,
    MultiSelectItem,
    Quantity,
    SelectTrigger,
    Size,
    Text,
    TextVariant,
} from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { useJourneyContext } from 'AIJourney/providers'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type {
    StatsFiltersWithLogicalOperator,
    WithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { MultiSelectFilterTrigger } from 'domains/reporting/pages/common/filters/MultiSelectFilterTrigger'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

const SELECT_ALL_ID = 'select-all'

type FilterOption = { id: string; label: string; value: string; count?: number }
type FilterSection = { id: string; items: FilterOption[] }

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
    const options = useMemo(
        () =>
            campaigns.map((c) => ({
                id: c.id,
                label: c.campaign?.title ?? 'Untitled',
            })),
        [campaigns],
    )

    const allIds = useMemo(() => options.map((o) => o.id), [options])
    const currentValue: WithLogicalOperator<string> = value ?? {
        operator: LogicalOperatorEnum.ONE_OF,
        values: allIds,
    }

    const allSelected = currentValue.values.length === allIds.length

    const toggleAllOption = useMemo<FilterOption>(
        () => ({
            id: SELECT_ALL_ID,
            label: allSelected ? 'Deselect all' : 'Select all',
            value: SELECT_ALL_ID,
            count: currentValue.values.length,
        }),
        [allSelected, currentValue.values.length],
    )

    const filterOptions = useMemo<FilterOption[]>(
        () =>
            options.map((o) => ({
                id: o.id,
                label: o.label,
                value: o.id,
            })),
        [options],
    )

    const sections = useMemo<FilterSection[]>(
        () => [
            { id: 'toggle', items: [toggleAllOption] },
            { id: 'items', items: filterOptions },
        ],
        [toggleAllOption, filterOptions],
    )

    const selectedOptions = useMemo(
        () => [
            ...(allSelected ? [toggleAllOption] : []),
            ...filterOptions.filter((o) =>
                currentValue.values.includes(o.value),
            ),
        ],
        [filterOptions, currentValue.values, allSelected, toggleAllOption],
    )

    const triggerPreview = useMemo(() => {
        if (currentValue.values.length === 0) return 'Select value...'
        if (allSelected) return 'All Campaigns'
        const [first, ...rest] = filterOptions.filter((o) =>
            currentValue.values.includes(o.value),
        )
        return rest.length > 0 ? `${first.label} +${rest.length}` : first.label
    }, [currentValue.values, allSelected, filterOptions])

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: currentValue.operator,
            })
        },
        [dispatchUpdate, currentValue.operator],
    )

    const handleSelect = useCallback(
        (selected: FilterOption[]) => {
            const hadSelectAll = allSelected
            const hasSelectAll = selected.some((o) => o.id === SELECT_ALL_ID)

            if (!hadSelectAll && hasSelectAll) {
                handleFilterValuesChange(allIds)
            } else if (hadSelectAll && !hasSelectAll) {
                handleFilterValuesChange([])
            } else {
                handleFilterValuesChange(
                    selected
                        .filter((o) => o.id !== SELECT_ALL_ID)
                        .map((o) => o.value),
                )
            }
        },
        [allSelected, allIds, handleFilterValuesChange],
    )

    return (
        <MultiSelect<FilterOption, FilterSection>
            onSelect={handleSelect}
            isSearchable
            aria-label="campaigns-filter"
            items={sections}
            selectedItems={selectedOptions}
            trigger={({ ref }) => (
                <SelectTrigger ref={ref}>
                    <MultiSelectFilterTrigger>
                        <Text variant={TextVariant.Bold} size={Size.Sm}>
                            Campaigns
                        </Text>
                        <Text variant={TextVariant.Regular} size={Size.Sm}>
                            {triggerPreview}
                        </Text>
                    </MultiSelectFilterTrigger>
                </SelectTrigger>
            )}
        >
            {(section) => (
                <ListSection id={section.id} items={section.items}>
                    {(option) => (
                        <MultiSelectItem
                            label={option.label}
                            trailingSlot={
                                option.count !== undefined ? (
                                    <Quantity
                                        quantity={option.count}
                                        size={Size.Md}
                                    />
                                ) : undefined
                            }
                        />
                    )}
                </ListSection>
            )}
        </MultiSelect>
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
