import React, {useCallback, useMemo} from 'react'
import _noop from 'lodash/noop'
import {connect} from 'react-redux'
import {DropdownOption} from 'pages/stats/types'
import useAppSelector from 'hooks/useAppSelector'

import Filter from 'pages/stats/common/components/Filter'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import useAppDispatch from 'hooks/useAppDispatch'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {emptyFilter} from 'pages/stats/common/filters/helpers'
import {RootState} from 'state/types'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {FilterLabels} from 'pages/stats/common/filters/constants'

type HelpCenterFilterProps = {
    value: StatsFiltersWithLogicalOperator[FilterKey.HelpCenters]
}

const HelpCenterFilter = ({value = emptyFilter}: HelpCenterFilterProps) => {
    const dispatch = useAppDispatch()
    const helpCenters = useAppSelector(getHelpCenterFAQList)
    const handleFilterChange = useCallback(
        (values: number[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    helpCenters: withDefaultLogicalOperator(values),
                })
            )
        },
        [dispatch]
    )
    const filterItems = useMemo(
        () => [
            {
                options: helpCenters.map(({id, name}) => ({
                    label: name,
                    value: `${id}`,
                })),
            },
        ],
        [helpCenters]
    )

    const selectedHelpCenterItems = useMemo(() => {
        const helpCenter = helpCenters.find(({id}) => id === value?.values[0])
        if (!helpCenter) return []
        return [{label: helpCenter.name, value: `${helpCenter.id}`}]
    }, [helpCenters, value])

    const onOptionChange = (opt: DropdownOption) => {
        handleFilterChange([Number(opt.value)])
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.HelpCenters]}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            isPersistent
            selectedOptions={selectedHelpCenterItems}
            selectedLogicalOperator={null}
            logicalOperators={[]}
            filterOptionGroups={filterItems}
            onChangeOption={onOptionChange}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onChangeLogicalOperator={_noop}
        />
    )
}

export default HelpCenterFilter

export const HelpCenterFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[
        FilterKey.HelpCenters
    ],
}))(HelpCenterFilter)
