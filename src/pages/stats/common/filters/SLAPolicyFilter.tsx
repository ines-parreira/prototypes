import {useListSlaPolicies} from '@gorgias/api-queries'
import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import useAppDispatch from 'hooks/useAppDispatch'
import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {LogicalOperatorLabel} from '../components/Filter/constants'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.SlaPolicies]
}

export const SLAPolicyFilter = ({value = emptyFilter}: Props) => {
    const {data} = useListSlaPolicies()
    const policies = useMemo(() => data?.data.data || [], [data?.data.data])
    const filterOptions = policies?.map((policy) => ({
        value: policy.uuid,
        label: policy.name,
    }))

    const dispatch = useAppDispatch()
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
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    slaPolicies: {
                        values,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
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
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.SlaPolicies,
            LogicalOperatorLabel[value.operator]
        )
        dispatch(statFiltersClean())
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

export const SLAPolicyFilterWithState = connect((state: RootState) => ({
    value: getStatsFiltersWithLogicalOperators(state)[FilterKey.SlaPolicies],
}))(SLAPolicyFilter)
