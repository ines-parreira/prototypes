import React, { useCallback, useMemo } from 'react'

import { useEffectOnce } from '@repo/hooks'
import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import Filter from 'domains/reporting/pages/common/components/Filter/Filter'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import type { RemovableFilter } from 'domains/reporting/pages/common/filters/types'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import type { DropdownOption } from 'domains/reporting/pages/types'
import {
    getStatsFiltersWithLogicalOperators,
    getStoreIntegrations,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import type { Integration } from 'models/integration/types'
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.StoreIntegrations]
    storeIntegrations: Integration[]
    dispatchUpdate: (
        value: StatsFiltersWithLogicalOperator[FilterKey.StoreIntegrations],
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
            FilterKey.StoreIntegrations,
            LogicalOperatorLabel[value.operator],
        )
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.StoreIntegrations]}
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
                value: StatsFiltersWithLogicalOperator[FilterKey.StoreIntegrations],
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
            FilterKey.StoreIntegrations
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
