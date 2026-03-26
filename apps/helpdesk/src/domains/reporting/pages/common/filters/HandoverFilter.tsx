import { useCallback, useMemo } from 'react'

import {
    ListSection,
    MultiSelect,
    MultiSelectItem,
    SelectTrigger,
    Size,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { MultiSelectFilterTrigger } from 'domains/reporting/pages/common/filters/MultiSelectFilterTrigger'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

const HANDOVER_OPTIONS = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
]

const ALL_VALUES = HANDOVER_OPTIONS.map((o) => o.value)

type FilterOption = { id: string; label: string; value: string }
type FilterSection = { id: string; items: FilterOption[] }

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Handover]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Handover],
            undefined
        >,
    ) => void
}

export const HandoverFilter = ({ value, dispatchUpdate }: Props) => {
    const currentValue = value ?? {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ALL_VALUES,
    }

    const allSelected = currentValue.values.length === ALL_VALUES.length

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: currentValue.operator,
            })
        },
        [dispatchUpdate, currentValue.operator],
    )

    const filterOptions = useMemo<FilterOption[]>(
        () =>
            HANDOVER_OPTIONS.map((o) => ({
                id: o.value,
                label: o.label,
                value: o.value,
            })),
        [],
    )

    const selectedOptions = useMemo(
        () =>
            filterOptions.filter((o) => currentValue.values.includes(o.value)),
        [filterOptions, currentValue.values],
    )

    const triggerPreview = useMemo(() => {
        if (currentValue.values.length === 0) return 'None'
        if (allSelected) return 'All'
        return selectedOptions.map((o) => o.label).join(', ')
    }, [currentValue.values.length, allSelected, selectedOptions])

    const sections: FilterSection[] = [{ id: 'items', items: filterOptions }]

    return (
        <MultiSelect<FilterOption, FilterSection>
            onSelect={(selected) =>
                handleFilterValuesChange(selected.map((o) => o.value))
            }
            aria-label="handover-filter"
            items={sections}
            selectedItems={selectedOptions}
            trigger={({ ref }) => (
                <SelectTrigger ref={ref}>
                    <MultiSelectFilterTrigger>
                        <Text variant={TextVariant.Bold} size={Size.Sm}>
                            Handover
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
                    {(option) => <MultiSelectItem label={option.label} />}
                </ListSection>
            )}
        </MultiSelect>
    )
}

export const HandoverFilterFromContext = () => {
    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    return (
        <HandoverFilter
            value={statsFilters?.[FilterKey.Handover]}
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.Handover],
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        handover: filter,
                    }),
                )
            }
        />
    )
}

export const HandoverFilterFromSavedContext = () => null
