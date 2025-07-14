import React, { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import { DropdownOption } from 'domains/reporting/pages/types'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.SlaPolicies]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.SlaPolicies],
            undefined
        >,
    ) => void
    dispatchStatFiltersDirty: () => void
    dispatchStatFiltersClean: () => void
}

export const SLAPolicyFilter = ({
    value = emptyFilter,
    dispatchUpdate,
    dispatchStatFiltersDirty,
    dispatchStatFiltersClean,
}: Props) => {
    const { data } = useListSlaPolicies()
    const policies = useMemo(() => data?.data.data || [], [data?.data.data])
    const filterOptions = policies?.map((policy) => ({
        value: policy.uuid,
        label: policy.name,
    }))

    const selectedPolicies = value.values
    const selectedOptions = useMemo(
        () =>
            selectedPolicies.map((p) => ({
                value: p,
                label: String(
                    policies.find((policy) => policy.uuid === p)?.name,
                ),
            })),
        [policies, selectedPolicies],
    )

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const onOptionChange = useCallback(
        (option: DropdownOption) => {
            const policyId = option.value
            if (selectedPolicies.includes(policyId)) {
                handleFilterValuesChange(
                    selectedPolicies.filter(
                        (selectedPolicyId) => selectedPolicyId !== policyId,
                    ),
                )
            } else {
                handleFilterValuesChange([...selectedPolicies, policyId])
            }
        },
        [handleFilterValuesChange, selectedPolicies],
    )

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.SlaPolicies,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.SlaPolicies]}
            filterOptionGroups={[{ options: filterOptions }]}
            selectedOptions={selectedOptions}
            onChangeOption={onOptionChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={() => {
                handleFilterValuesChange(policies.map((policy) => policy.uuid))
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={_noop}
            isPersistent={true}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export const SLAPolicyFilterWithState = connect(
    (state: RootState) => ({
        value: getStatsFiltersWithLogicalOperators(state)[
            FilterKey.SlaPolicies
        ],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            mergeStatsFiltersWithLogicalOperator({
                [FilterKey.SlaPolicies]: filter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(SLAPolicyFilter)
