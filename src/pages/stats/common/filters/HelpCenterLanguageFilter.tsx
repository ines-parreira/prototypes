import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocaleSelectOptions} from 'pages/settings/helpCenter/utils/localeSelectOptions'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import Filter from 'pages/stats/common/components/Filter/Filter'
import {
    FilterLabels,
    helpCenterLanguageFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {DropdownOption} from 'pages/stats/types'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator['localeCodes']
}

const HelpCenterLanguageFilter = ({value = emptyFilter}: Props) => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()
    const {helpCenters: selectedHelpCenterId} = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    const helpCenters = useAppSelector(getHelpCenterFAQList)

    const selectedHelpCenterItem = useMemo(() => {
        return helpCenters.filter(
            ({id}) => id === selectedHelpCenterId?.values[0]
        )
    }, [helpCenters, selectedHelpCenterId])
    const helpCenterLocales = getLocaleSelectOptions(
        locales,
        selectedHelpCenterItem[0].supported_locales
    )

    const languages = useMemo(
        () => [
            {
                options: helpCenterLocales.map((locale) => ({
                    label: locale.text,
                    value: locale.value,
                })),
            },
        ],
        [helpCenterLocales]
    )

    const selectedLocales = () => {
        const locales = helpCenterLocales.filter((locale) =>
            value.values.includes(locale.value)
        )
        return locales.map((locale) => ({
            label: locale.text,
            value: locale.value,
        }))
    }

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    localeCodes: {values, operator: value.operator},
                })
            )
        },
        [dispatch, value.operator]
    )

    const onOptionChange = (opt: DropdownOption) => {
        if (value.values.length === 1 && opt.value === value.values[0]) return

        if (value.values.includes(opt.value)) {
            handleFilterValuesChange(
                value.values.filter((locale) => locale !== opt.value)
            )
        } else {
            handleFilterValuesChange([...value.values, opt.value])
        }
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    localeCodes: {
                        values: value.values,
                        operator,
                    },
                })
            )
        },
        [dispatch, value.values]
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.LocaleCodes,
            LogicalOperatorLabel[value.operator]
        )
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.LocaleCodes]}
            showQuickSelect={false}
            showSearch={false}
            isPersistent
            selectedOptions={selectedLocales()}
            selectedLogicalOperator={value.operator}
            logicalOperators={helpCenterLanguageFilterLogicalOperators}
            filterOptionGroups={languages}
            onChangeOption={onOptionChange}
            onRemove={_noop}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export default HelpCenterLanguageFilter

export const HelpCenterLanguageFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.LocaleCodes
        ],
    })
)(HelpCenterLanguageFilter)
