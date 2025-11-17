import React, { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import Filter from 'domains/reporting/pages/common/components/Filter/Filter'
import {
    FilterLabels,
    helpCenterLanguageFilterLogicalOperators,
} from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppSelector from 'hooks/useAppSelector'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getLocaleSelectOptions } from 'pages/settings/helpCenter/utils/localeSelectOptions'
import { getHelpCenterFAQList } from 'state/entities/helpCenter/helpCenters'
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.LocaleCodes]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.LocaleCodes],
            undefined
        >,
    ) => void
}

const HelpCenterLanguageFilter = ({
    value = emptyFilter,
    dispatchUpdate,
}: Props) => {
    const locales = useSupportedLocales()
    const { helpCenters: selectedHelpCenterId } = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    const helpCenters = useAppSelector(getHelpCenterFAQList)

    const selectedHelpCenterItem = useMemo(() => {
        return helpCenters.filter(
            ({ id }) => id === selectedHelpCenterId?.values[0],
        )
    }, [helpCenters, selectedHelpCenterId])
    const helpCenterLocales = getLocaleSelectOptions(
        locales,
        selectedHelpCenterItem[0]?.supported_locales ?? [],
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
        [helpCenterLocales],
    )

    const selectedLocales = () => {
        const locales = helpCenterLocales.filter((locale) =>
            value.values.includes(locale.value),
        )
        return locales.map((locale) => ({
            label: locale.text,
            value: locale.value,
        }))
    }

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({ values, operator: value.operator })
        },
        [dispatchUpdate, value.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        if (value.values.length === 1 && opt.value === value.values[0]) return

        if (value.values.includes(opt.value)) {
            handleFilterValuesChange(
                value.values.filter((locale) => locale !== opt.value),
            )
        } else {
            handleFilterValuesChange([...value.values, opt.value])
        }
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                values: value.values,
                operator,
            })
        },
        [dispatchUpdate, value.values],
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.LocaleCodes,
            LogicalOperatorLabel[value.operator],
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
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                localeCodes: filter,
            }),
    },
)(HelpCenterLanguageFilter)
