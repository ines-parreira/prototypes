import React, { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import { emptyFilter } from 'domains/reporting/pages/common/filters/helpers'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Journeys]
    dispatchUpdate: (
        value: StatsFiltersWithLogicalOperator[FilterKey.Journeys],
    ) => void
}

export const JOURNEYS_FILTER_VALUES = {
    CAMPAIGN: 'campaign',
    // TODO: rename to flow
    JOURNEY: 'journey',
}

export const JourneysFilter = ({
    value = emptyFilter,
    dispatchUpdate,
}: Props) => {
    const availableJourneys = useMemo(
        () => [
            {
                value: JOURNEYS_FILTER_VALUES.CAMPAIGN,
                label: 'Campaigns',
            },
            {
                value: JOURNEYS_FILTER_VALUES.JOURNEY,
                label: 'Journeys',
            },
        ],
        [],
    )

    const filterOptions = [
        {
            options: availableJourneys,
        },
    ]

    const getSelectedJourneys = () => {
        return availableJourneys
            .filter((journey) => value.values.includes(journey.value))
            .map((journey) => ({
                label: journey.label,
                value: journey.value,
            }))
    }

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values: values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value?.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = opt.value
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((journey) => journey !== id),
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Journeys]}
            filterOptionGroups={filterOptions}
            selectedOptions={getSelectedJourneys()}
            onChangeOption={onOptionChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            isMultiple={true}
            showSearch={false}
            showQuickSelect={false}
            isPersistent
        />
    )
}

export const JourneysFilterWithState = connect(
    (state: RootState) => ({
        value: getStatsFiltersWithLogicalOperators(state)[FilterKey.Journeys],
    }),
    {
        dispatchUpdate: (
            filter: StatsFiltersWithLogicalOperator[FilterKey.Journeys],
        ) =>
            mergeStatsFiltersWithLogicalOperator({
                journeys: filter,
            }),
    },
)(JourneysFilter)
