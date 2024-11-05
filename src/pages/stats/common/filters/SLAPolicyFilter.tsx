import {useListSlaPolicies} from '@gorgias/api-queries'
import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {DropdownOption} from 'pages/stats/types'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {upsertSavedFilterFilter} from 'state/ui/stats/filtersSlice'

import {LogicalOperatorLabel} from '../components/Filter/constants'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.SlaPolicies]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.SlaPolicies],
            undefined
        >
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
    const {data} = useListSlaPolicies()
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
                    policies.find((policy) => policy.uuid === p)?.name
                ),
            })),
        [policies, selectedPolicies]
    )

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator]
    )

    const onOptionChange = useCallback(
        (option: DropdownOption) => {
            const policyId = option.value
            if (selectedPolicies.includes(policyId)) {
                handleFilterValuesChange(
                    selectedPolicies.filter(
                        (selectedPolicyId) => selectedPolicyId !== policyId
                    )
                )
            } else {
                handleFilterValuesChange([...selectedPolicies, policyId])
            }
        },
        [handleFilterValuesChange, selectedPolicies]
    )

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.SlaPolicies,
            LogicalOperatorLabel[value.operator]
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.SlaPolicies]}
            filterOptionGroups={[{options: filterOptions}]}
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
            upsertSavedFilterFilter({
                member: FilterKey.SlaPolicies,
                operator: filter.operator,
                values: filter.values.map(String),
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    }
)(SLAPolicyFilter)
