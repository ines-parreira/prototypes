import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'
import _noop from 'lodash/noop'
import {StatsFiltersWithLogicalOperator, FilterKey} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter/Filter'
import useAppDispatch from 'hooks/useAppDispatch'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {emptyFilter} from 'pages/stats/common/filters/helpers'
import {
    getStatsFiltersWithLogicalOperators,
    getStoreIntegrations,
} from 'state/stats/selectors'
import {RootState} from 'state/types'
import {DropdownOption} from 'pages/stats/types'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {StoreIntegration} from 'models/integration/types'

type Props = {
    value: StatsFiltersWithLogicalOperator['integrations']
    storeIntegrations: StoreIntegration[]
} & RemovableFilter

export const STORE_FILTER_NAME = 'Report on'

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

    const onOptionChange = useCallback(
        (option: DropdownOption) => {
            const id = Number(option.value)
            if (value.values.includes(id)) {
                handleFilterValuesChange(
                    value.values.filter((storeId) => storeId !== id)
                )
            } else {
                handleFilterValuesChange([...value.values, id])
            }
        },
        [handleFilterValuesChange, value.values]
    )

    return (
        <Filter
            filterName={STORE_FILTER_NAME}
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
        />
    )
}

export const StoreFilterWithState = connect((state: RootState) => ({
    value: getStatsFiltersWithLogicalOperators(state)[FilterKey.Integrations],
    storeIntegrations: getStoreIntegrations(state),
}))(StoreFilter)
