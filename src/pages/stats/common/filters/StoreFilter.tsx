import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import {Integration} from 'models/integration/types'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    StatsFiltersWithLogicalOperator,
    FilterKey,
    FilterComponentKey,
} from 'models/stat/types'
import {LogicalOperatorLabel} from 'pages/stats/common/components/Filter/constants'
import Filter from 'pages/stats/common/components/Filter/Filter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {DropdownOption} from 'pages/stats/types'
import {
    getStatsFiltersWithLogicalOperators,
    getStoreIntegrations,
} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Integrations]
    storeIntegrations: Integration[]
} & RemovableFilter

export default function StoreFilter({
    value = emptyFilter,
    storeIntegrations,
}: Props) {
    const dispatch = useAppDispatch()

    const options = useMemo(
        () => [
            {
                options: storeIntegrations.map((storeIntegration) => ({
                    label: `${storeIntegration.name}`,
                    value: `${storeIntegration.id}`,
                })),
            },
        ],
        [storeIntegrations]
    )

    const selectedOptions = useMemo(
        () =>
            storeIntegrations
                .filter((storeIntegration) =>
                    value.values.includes(storeIntegration.id)
                )
                .map((storeIntegration) => ({
                    label: storeIntegration.name,
                    value: `${storeIntegration.id}`,
                })),
        [value.values, storeIntegrations]
    )

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    integrations: {
                        values,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
    )

    const onOptionChange = (opt: DropdownOption) => {
        handleFilterValuesChange([Number(opt.value)])
    }

    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterComponentKey.Store,
            LogicalOperatorLabel[value.operator]
        )
    }

    return (
        <Filter
            filterName={FilterLabels[FilterComponentKey.Store]}
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
    const {selectedIntegrations, integrations} = useCampaignStatsFilters()
    return (
        <StoreFilter
            storeIntegrations={integrations}
            value={withLogicalOperator(selectedIntegrations)}
        />
    )
}

export const StoreFilterWithState = connect((state: RootState) => ({
    value: getStatsFiltersWithLogicalOperators(state)[FilterKey.Integrations],
    storeIntegrations: getStoreIntegrations(state),
}))(StoreFilter)
