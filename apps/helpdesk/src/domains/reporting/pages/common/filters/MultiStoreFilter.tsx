import { useCallback, useMemo } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { StoreIntegration, useListStores } from '@gorgias/helpdesk-queries'

import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import {
    FilterLabels,
    integrationsFilterLogicalOperators,
} from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Stores]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Stores],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export default function MultiStoreFilter({
    value = emptyFilter,
    warningType,
    dispatchUpdate,
    dispatchRemove,
    onRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    initializeAsOpen = false,
    isDisabled = false,
}: Props) {
    const { data } = useListStores()

    const stores: StoreIntegration[] = useMemo(
        () => data?.data?.data ?? [],
        [data?.data?.data],
    )

    const multiStores = useMemo(
        () =>
            stores
                .filter((store) =>
                    value.values.includes(store.store_integration_id),
                )
                .map((store) => ({
                    label: store.name,
                    value: `${store.store_integration_id}`,
                })),
        [value, stores],
    )

    const multiStoreOptionGroups = useMemo(
        () => [
            {
                options: stores.map((store) => ({
                    label: store.name,
                    value: `${store.store_integration_id}`,
                })),
            },
        ],
        [stores],
    )

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = Number(opt.value)

        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((multiStoreId) => multiStoreId !== id),
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                values: value.values,
                operator: operator,
            })
        },
        [dispatchUpdate, value.values],
    )

    const clientSideFilter = useClientSideFilterSearch(multiStoreOptionGroups)

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.Stores, LogicalOperatorLabel[value.operator])
        dispatchStatFiltersClean()
        clientSideFilter.onClear()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Stores]}
            filterErrors={{ warningType }}
            selectedOptions={multiStores}
            selectedLogicalOperator={value.operator}
            logicalOperators={integrationsFilterLogicalOperators}
            filterOptionGroups={clientSideFilter.result}
            search={clientSideFilter.value}
            onSearch={clientSideFilter.onSearch}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    clientSideFilter.result[0].options.map((store) =>
                        Number(store.value),
                    ),
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatchRemove()
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            isDisabled={isDisabled}
        />
    )
}

export const MultiStoreFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Stores],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                stores: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                stores: emptyFilter,
            }),
    },
)(MultiStoreFilter)

export const MultiStoreFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[FilterKey.Stores],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.Stores,
                operator: filter.operator,
                values: filter.values.map(String),
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.Stores,
            }),
    },
)(MultiStoreFilter)
