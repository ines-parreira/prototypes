import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {DropdownOption} from 'pages/stats/types'

import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.HelpCenters]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.HelpCenters],
            undefined
        >
    ) => void
}

const HelpCenterFilter = ({value = emptyFilter, dispatchUpdate}: Props) => {
    const helpCenters = useAppSelector(getHelpCenterFAQList)
    const handleFilterChange = useCallback(
        (values: number[]) => {
            dispatchUpdate(withDefaultLogicalOperator(values))
        },
        [dispatchUpdate]
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

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.HelpCenters, null)
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
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export default HelpCenterFilter

export const HelpCenterFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.HelpCenters
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                helpCenters: filter,
            }),
    }
)(HelpCenterFilter)
