import { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'

import type { JourneyApiDTO } from '@gorgias/convert-client'

import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'
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
    const allIds = useMemo(() => journeys.map((j) => j.id), [journeys])
    const currentValue = value ?? {
        operator: LogicalOperatorEnum.ONE_OF,
        values: allIds,
    }

    const filterOptionGroups = useMemo(
        () => [
            {
                options: journeys.map((journey) => ({
                    label: JOURNEY_TYPE_MAP_TO_STRING[journey.type],
                    value: journey.id,
                })),
            },
        ],
        [journeys],
    )

    const selectedOptions = useMemo(
        () =>
            journeys
                .filter((j) => currentValue.values.includes(j.id))
                .map((j) => ({
                    label: JOURNEY_TYPE_MAP_TO_STRING[j.type],
                    value: j.id,
                })),
        [journeys, currentValue.values],
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

    return (
        <Filter
            filterName={FilterLabels[FilterKey.JourneyFlows]}
            displayLabel={allSelected ? 'All Flows' : undefined}
            filterOptionGroups={filterOptionGroups}
            selectedOptions={selectedOptions}
            onChangeOption={onOptionChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={() => handleFilterValuesChange(allIds)}
            onRemoveAll={() => handleFilterValuesChange([])}
            isMultiple
            isPersistent
            showQuickSelect
            showSearch={false}
        />
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
