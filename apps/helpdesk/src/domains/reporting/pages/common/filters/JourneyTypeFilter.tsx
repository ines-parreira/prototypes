import { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.JourneyType]
    dispatchUpdate: (
        value: StatsFiltersWithLogicalOperator[FilterKey.JourneyType],
    ) => void
}

export const JOURNEY_TYPE_FILTER_VALUES = {
    CAMPAIGN: 'campaign',
    FLOW: 'flow',
}

const emptyFilter = {
    operator: LogicalOperatorEnum.ONE_OF,
    values: [
        JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN,
        JOURNEY_TYPE_FILTER_VALUES.FLOW,
    ],
}

export const JourneyTypeFilter = ({
    value = emptyFilter,
    dispatchUpdate,
}: Props) => {
    const availableJourneys = useMemo(
        () => [
            {
                value: JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN,
                label: 'Campaigns',
            },
            {
                value: JOURNEY_TYPE_FILTER_VALUES.FLOW,
                label: 'Flows',
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
            filterName={FilterLabels[FilterKey.JourneyType]}
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
        value: getStatsFiltersWithLogicalOperators(state)[
            FilterKey.JourneyType
        ],
    }),
    {
        dispatchUpdate: (
            filter: StatsFiltersWithLogicalOperator[FilterKey.JourneyType],
        ) =>
            mergeStatsFiltersWithLogicalOperator({
                journeyType: filter,
            }),
    },
)(JourneyTypeFilter)
