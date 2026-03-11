import { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

const HANDOVER_OPTIONS = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
]

const ALL_VALUES = HANDOVER_OPTIONS.map((o) => o.value)

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Handover]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Handover],
            undefined
        >,
    ) => void
}

export const HandoverFilter = ({ value, dispatchUpdate }: Props) => {
    const currentValue = value ?? {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ALL_VALUES,
    }

    const filterOptionGroups = useMemo(
        () => [{ options: HANDOVER_OPTIONS }],
        [],
    )

    const selectedOptions = useMemo(
        () =>
            HANDOVER_OPTIONS.filter((o) =>
                currentValue.values.includes(o.value),
            ),
        [currentValue.values],
    )

    const allSelected = currentValue.values.length === ALL_VALUES.length

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: currentValue.operator,
            })
        },
        [dispatchUpdate, currentValue.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = opt.value
        if (currentValue.values.includes(id)) {
            handleFilterValuesChange(
                currentValue.values.filter((v) => v !== id),
            )
        } else {
            handleFilterValuesChange([...currentValue.values, id])
        }
    }

    return (
        <Filter
            search=""
            filterName={FilterLabels[FilterKey.Handover]}
            displayLabel={allSelected ? 'All' : undefined}
            filterOptionGroups={filterOptionGroups}
            selectedOptions={selectedOptions}
            onSearch={_noop}
            onChangeOption={onOptionChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={() => handleFilterValuesChange(ALL_VALUES)}
            onRemoveAll={() => handleFilterValuesChange([])}
            isMultiple
            isPersistent
            showQuickSelect
            showSearch={false}
        />
    )
}

export const HandoverFilterFromContext = () => {
    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    return (
        <HandoverFilter
            value={statsFilters?.[FilterKey.Handover]}
            dispatchUpdate={(
                filter: StatsFiltersWithLogicalOperator[FilterKey.Handover],
            ) =>
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        handover: filter,
                    }),
                )
            }
        />
    )
}

export const HandoverFilterFromSavedContext = () => null
