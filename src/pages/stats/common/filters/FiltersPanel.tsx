import React, {createElement, useCallback, useMemo, useState} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {AddFilterButton} from 'pages/stats/common/filters/AddFilterButton'
import {ChannelsFilterWithState} from 'pages/stats/common/filters/ChannelsFilter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import css from 'pages/stats/common/filters/FiltersPanel.less'
import {IntegrationsFilterWithState} from 'pages/stats/common/filters/IntegrationsFilter'
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

type Props = {
    persistentFilters?: FilterKey[]
    optionalFilters?: FilterKey[]
}

export const UNSUPPORTED_FILTER_PLACEHOLDER = 'placeholder'

export const renderFilter = (filter: FilterKey) => {
    switch (filter) {
        case FilterKey.Period:
            return PeriodFilterWithState
        case FilterKey.Channels:
            return ChannelsFilterWithState
        case FilterKey.Integrations:
            return IntegrationsFilterWithState
        default:
            return () => <div>{UNSUPPORTED_FILTER_PLACEHOLDER}</div>
    }
}

const getInitialActiveFilters = (
    optionalFilters: FilterKey[],
    cleanStatsFilters: StatsFilters
) =>
    optionalFilters.reduce<Partial<Record<FilterKey, boolean>>>(
        (filtersMap, filterKey) => {
            filtersMap[filterKey] = cleanStatsFilters[filterKey] !== undefined
            return filtersMap
        },
        {}
    )

export const FiltersPanel = ({
    persistentFilters = [],
    optionalFilters = [],
}: Props) => {
    const {cleanStatsFilters} = useAppSelector(getCleanStatsFiltersWithTimezone)
    const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(
        getInitialActiveFilters(optionalFilters, cleanStatsFilters)
    )

    const options = useMemo(
        () =>
            optionalFilters
                .filter((filter) => !activeFilters[filter])
                .map((filter) => ({
                    value: filter,
                    label: FilterLabels[filter],
                })),
        [activeFilters, optionalFilters]
    )

    const optionalFiltersToRender = useMemo(
        () =>
            Object.keys(activeFilters).reduce<FilterKey[]>(
                (toRender, filter) => {
                    if (activeFilters[filter]) {
                        toRender.push(filter as FilterKey)
                    }
                    return toRender
                },
                []
            ),
        [activeFilters]
    )

    const handleOnClick = useCallback(
        (value: FilterKey) =>
            setActiveFilters({
                ...activeFilters,
                [value]: true,
            }),
        [activeFilters]
    )

    return (
        <div className={css.wrapper}>
            {[...persistentFilters, ...optionalFiltersToRender].map((filter) =>
                createElement(renderFilter(filter), {
                    onRemove: () =>
                        setActiveFilters({
                            ...activeFilters,
                            [filter]: false,
                        }),
                })
            )}
            {options.length > 0 && (
                <AddFilterButton options={options} onClick={handleOnClick} />
            )}
        </div>
    )
}
