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

import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
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
    value: StatsFiltersWithLogicalOperator[FilterKey.JourneyFlows]
    journeys: JourneyApiDTO[]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.JourneyFlows],
            undefined
        >,
    ) => void
}

export const JourneyFlowsFilter = ({
    value,
    journeys,
    dispatchUpdate,
}: Props) => {
    const options = useMemo(
        () =>
            journeys.map((j) => ({
                id: j.id,
                label: j.name || JOURNEY_TYPE_MAP_TO_STRING[j.type],
            })),
        [journeys],
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
        if (allSelected) return 'All Flows'
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
            aria-label="flows-filter"
            items={sections}
            selectedItems={selectedOptions}
            trigger={({ ref }) => (
                <SelectTrigger ref={ref}>
                    <MultiSelectFilterTrigger>
                        <Text variant={TextVariant.Bold} size={Size.Sm}>
                            Flows
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

export const JourneyFlowsFilterFromContext = () => {
    const dispatch = useAppDispatch()
    const { journeys } = useJourneyContext()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    if (!journeys || journeys.length === 0) return null

    return (
        <JourneyFlowsFilter
            journeys={journeys}
            value={
                statsFilters?.[FilterKey.JourneyFlows] ??
                withLogicalOperator(journeys.map((j) => j.id))
            }
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.JourneyFlows],
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        journeyFlows: filter,
                    }),
                )
            }
        />
    )
}

export const JourneyFlowsFilterFromSavedContext = () => null
