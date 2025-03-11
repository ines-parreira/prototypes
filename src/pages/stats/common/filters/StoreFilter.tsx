import React, { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import { Integration } from 'models/integration/types'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {
    FilterComponentKey,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import { LogicalOperatorLabel } from 'pages/stats/common/components/Filter/constants'
import Filter from 'pages/stats/common/components/Filter/Filter'
import { FilterLabels } from 'pages/stats/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import { RemovableFilter } from 'pages/stats/common/filters/types'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { DropdownOption } from 'pages/stats/types'
import {
    getStatsFiltersWithLogicalOperators,
    getStoreIntegrations,
} from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterComponentKey.StoreIntegrations]
    storeIntegrations: Integration[]
    dispatchUpdate: (
        value: StatsFiltersWithLogicalOperator[FilterComponentKey.StoreIntegrations],
    ) => void
} & RemovableFilter

export default function StoreFilter({
    value = emptyFilter,
    storeIntegrations,
    dispatchUpdate,
}: Props) {
    const options = useMemo(
        () => [
            {
                options: storeIntegrations.map((storeIntegration) => ({
                    label: `${storeIntegration.name}`,
                    value: `${storeIntegration.id}`,
                })),
            },
        ],
        [storeIntegrations],
    )

    const selectedOptions = useMemo(
        () =>
            storeIntegrations
                .filter((storeIntegration) =>
                    value.values.includes(storeIntegration.id),
                )
                .map((storeIntegration) => ({
                    label: storeIntegration.name,
                    value: `${storeIntegration.id}`,
                })),
        [value.values, storeIntegrations],
    )

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatchUpdate(withDefaultLogicalOperator(values))
        },
        [dispatchUpdate],
    )

    const onOptionChange = (opt: DropdownOption) => {
        handleFilterValuesChange([Number(opt.value)])
    }

    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterComponentKey.StoreIntegrations,
            LogicalOperatorLabel[value.operator],
        )
    }

    return (
        <Filter
            filterName={FilterLabels[FilterComponentKey.StoreIntegrations]}
            filterOptionGroups={options}
            logicalOperators={[]}
            onChangeOption={onOptionChange}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onChangeLogicalOperator={_noop}
            selectedOptions={selectedOptions}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            isPersistent
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export const StoreFilterFromContext = () => {
    const dispatch = useAppDispatch()
    const { selectedIntegrations, storeIntegrations } =
        useCampaignStatsFilters()

    // Set initial filter value
    useEffectOnce(() => {
        dispatch(
            mergeStatsFiltersWithLogicalOperator({
                storeIntegrations:
                    withDefaultLogicalOperator(selectedIntegrations),
            }),
        )
    })

    return (
        <StoreFilter
            storeIntegrations={storeIntegrations}
            value={withLogicalOperator(selectedIntegrations)}
            dispatchUpdate={(
                value: StatsFiltersWithLogicalOperator[FilterComponentKey.StoreIntegrations],
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        storeIntegrations: value,
                    }),
                )
            }
        />
    )
}

export const StoreFilterWithState = connect(
    (state: RootState) => ({
        value: getStatsFiltersWithLogicalOperators(state)[
            FilterComponentKey.StoreIntegrations
        ],
        storeIntegrations: getStoreIntegrations(state),
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                storeIntegrations: filter,
            }),
    },
)(StoreFilter)
