import React, {
    ComponentProps,
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import _isEqual from 'lodash/isEqual'
import {BusiestTimesMetricSelectFilter} from 'pages/stats/common/filters/BusiestTimesMetricSelectFilter'
import {TagsFilterWithState} from 'pages/stats/common/filters/TagsFilter'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import useAppSelector from 'hooks/useAppSelector'
import {
    FilterComponentKey,
    FilterKey,
    StaticFilter,
    StatsFilters,
} from 'models/stat/types'
import {AddFilterButton} from 'pages/stats/common/filters/AddFilterButton'
import {AgentsFiltersWithState} from 'pages/stats/common/filters/AgentsFilter'
import {ChannelsFilterWithState} from 'pages/stats/common/filters/ChannelsFilter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {CustomFieldsFilterFilterWithState} from 'pages/stats/common/filters/CustomFieldsFilter'
import css from 'pages/stats/common/filters/FiltersPanel.less'
import {IntegrationsFilterWithState} from 'pages/stats/common/filters/IntegrationsFilter'
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'
import {HelpCenterFilterWithState} from 'pages/stats/common/filters/HelpCenterFilter'
import {HelpCenterLanguageFilterWithState} from 'pages/stats/common/filters/HelpCenterLanguageFilter'
import {StoreFilterWithState} from 'pages/stats/common/filters/StoreFilter'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/CustomFieldSelect'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'
import {CustomFieldFilter} from 'pages/stats/common/filters/CustomFieldFilter'
import usePrevious from 'hooks/usePrevious'

type Props = {
    persistentFilters?: StaticFilter[]
    optionalFilters?: FilterKey[]
    filterSettingsOverrides?: {
        [FilterKey.Period]?: Omit<
            ComponentProps<typeof PeriodFilterWithState>,
            'value'
        >
        [FilterKey.Channels]?: Omit<
            ComponentProps<typeof ChannelsFilterWithState>,
            'value'
        >
    }
}

export const UNSUPPORTED_FILTER_PLACEHOLDER = 'placeholder'

export const renderFilter = (filter: FilterKey | FilterComponentKey) => {
    switch (filter) {
        case FilterKey.Period:
            return PeriodFilterWithState
        case FilterKey.CustomFields:
            return CustomFieldsFilterFilterWithState
        case FilterKey.Channels:
            return ChannelsFilterWithState
        case FilterKey.Integrations:
            return IntegrationsFilterWithState
        case FilterKey.Agents:
            return AgentsFiltersWithState
        case FilterKey.Tags:
            return TagsFilterWithState
        case FilterKey.HelpCenters:
            return HelpCenterFilterWithState
        case FilterKey.LocaleCodes:
            return HelpCenterLanguageFilterWithState
        case FilterComponentKey.BusiestTimesMetricSelectFilter:
            return BusiestTimesMetricSelectFilter
        case FilterComponentKey.CustomField:
            return CustomFieldFilter
        case FilterComponentKey.Store:
            return StoreFilterWithState
        default:
            return () => <div>{UNSUPPORTED_FILTER_PLACEHOLDER}</div>
    }
}

export function isFilterTypeWithValues(
    type: FilterKey | FilterComponentKey
): type is Exclude<
    FilterKey | FilterComponentKey,
    | FilterKey.CustomFields
    | FilterKey.Period
    | FilterComponentKey.CustomField
    | FilterComponentKey.Store
    | FilterComponentKey.BusiestTimesMetricSelectFilter
> {
    return (
        type !== FilterKey.CustomFields &&
        type !== FilterKey.Period &&
        type !== FilterComponentKey.CustomField &&
        type !== FilterComponentKey.Store &&
        type !== FilterComponentKey.BusiestTimesMetricSelectFilter
    )
}

const getActiveFilters = (
    optionalFilters: FilterKey[],
    cleanStatsFilters: StatsFilters
) =>
    optionalFilters.reduce<ActiveFilter[]>((arr, filterKey) => {
        if (
            filterKey !== FilterKey.CustomFields &&
            filterKey !== FilterKey.Period
        ) {
            const filter = cleanStatsFilters[filterKey]
            return [
                ...arr,
                {
                    key: filterKey,
                    type: filterKey,
                    active: filter !== undefined && filter.values.length > 0,
                    initialiseAsOpen: false,
                },
            ]
        }
        return arr
    }, [])

type FilterComponent = {
    key: string
    active: boolean
    initialiseAsOpen: boolean
}

type CustomFieldFilter = FilterComponent & {
    type: FilterKey.CustomFields
    customFieldId: number
    filterName: string
}

type ActiveFilter =
    | (FilterComponent & {
          type: StaticFilter
      })
    | CustomFieldFilter

export const FiltersPanel = ({
    persistentFilters = [],
    optionalFilters = [],
    filterSettingsOverrides,
}: Props) => {
    const {cleanStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone
    )
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
        getActiveFilters(optionalFilters, cleanStatsFilters)
    )

    const previousCleanStatsFilters = usePrevious(cleanStatsFilters)

    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)
    const activeDropdownFields = activeFields.filter(selectDropdownTextFields)
    const customFieldFilters: CustomFieldFilter[] = activeDropdownFields.map(
        (field) => ({
            type: FilterKey.CustomFields,
            key: `${FilterKey.CustomFields}::${field.id}`,
            filterName: field.label,
            customFieldId: field.id,
            active: false,
            initialiseAsOpen: false,
        })
    )

    useEffect(() => {
        const newFilters = optionalFilters.filter(
            (filter) =>
                filter !== FilterKey.CustomFields &&
                filter !== FilterKey.Period &&
                activeFilters.find(
                    (activeFilter) => activeFilter.key === filter
                ) === undefined
        )
        const updatedActiveFilters = activeFilters.map((filter) => {
            if (
                isFilterTypeWithValues(filter.type) &&
                (cleanStatsFilters[filter.type]?.values ?? []).length > 0 &&
                !filter.active
            ) {
                return {...filter, active: true}
            }
            return filter
        })

        if (
            newFilters.length > 0 ||
            (!_isEqual(updatedActiveFilters, activeFilters) &&
                !_isEqual(cleanStatsFilters, previousCleanStatsFilters))
        ) {
            const newActiveFilters = getActiveFilters(
                newFilters,
                cleanStatsFilters
            )
            setActiveFilters([...newActiveFilters, ...updatedActiveFilters])
        }
    }, [
        activeFilters,
        cleanStatsFilters,
        optionalFilters,
        previousCleanStatsFilters,
    ])

    useEffect(() => {
        if (
            optionalFilters.includes(FilterKey.CustomFields) &&
            customFieldFilters.length > 0 &&
            !activeFilters.find(
                (filter) => filter.type === FilterKey.CustomFields
            )
        ) {
            setActiveFilters([...activeFilters, ...customFieldFilters])
        }
    }, [activeFilters, customFieldFilters, optionalFilters])

    const options = activeFilters
        .filter((filter) => !filter.active)
        .map((filter) => {
            if (filter.type === FilterKey.CustomFields) {
                return {
                    value: filter.key,
                    label: filter.filterName,
                    type: FilterKey.CustomFields,
                }
            }
            return {
                value: filter.key,
                label: FilterLabels[filter.type],
            }
        })

    const optionalFiltersToRender = useMemo(
        () => activeFilters.filter((filter) => filter.active),
        [activeFilters]
    )

    const handleOnClick = useCallback(
        (value: string) =>
            setActiveFilters(
                activeFilters.map((filter) => {
                    if (filter.key === value) {
                        return {
                            ...filter,
                            active: true,
                            initialiseAsOpen: true,
                        }
                    }
                    return filter
                })
            ),
        [activeFilters]
    )

    const filtersToRender: ActiveFilter[] = [
        ...persistentFilters.map((filter) => ({
            key: filter,
            type: filter,
            active: true,
            initialiseAsOpen: false,
        })),
        ...optionalFiltersToRender,
    ]

    return (
        <div className={css.wrapper}>
            {filtersToRender.map((filter) =>
                createElement(renderFilter(filter.type), {
                    onRemove: () =>
                        setActiveFilters(
                            activeFilters.map((activeFilter) => {
                                if (activeFilter.key === filter.key) {
                                    return {
                                        ...activeFilter,
                                        active: false,
                                    }
                                }
                                return activeFilter
                            })
                        ),
                    key: filter.key,
                    initialiseAsOpen: filter.initialiseAsOpen,
                    filterName:
                        filter.type === FilterKey.CustomFields
                            ? filter.filterName
                            : '',
                    customFieldId:
                        filter.type === FilterKey.CustomFields
                            ? filter.customFieldId
                            : 0,
                    ...getFilterSettings(filter.key, filterSettingsOverrides),
                })
            )}
            {options.length > 0 && (
                <AddFilterButton options={options} onClick={handleOnClick} />
            )}
        </div>
    )
}

const getFilterSettings = (
    filterKey: string,
    settings?: {
        [FilterKey.Period]?: ComponentProps<typeof PeriodFilterWithState>
        [FilterKey.Channels]?: ComponentProps<typeof ChannelsFilterWithState>
    }
) => {
    switch (filterKey) {
        case FilterKey.Period:
            return settings?.[FilterKey.Period]
        case FilterKey.Channels:
            return settings?.[FilterKey.Channels]
        default:
            return undefined
    }
}
