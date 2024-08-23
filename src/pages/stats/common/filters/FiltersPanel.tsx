import React, {
    ComponentProps,
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {TagsFilterWithState} from 'pages/stats/common/filters/TagsFilter'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import useAppSelector from 'hooks/useAppSelector'
import {FilterKey, StaticFilter, StatsFilters} from 'models/stat/types'
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
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/CustomFieldSelect'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'

type Props = {
    persistentFilters?: StaticFilter[]
    optionalFilters?: FilterKey[]
    filterSettingsOverrides?: {
        [FilterKey.Period]: Omit<
            ComponentProps<typeof PeriodFilterWithState>,
            'value'
        >
    }
}

export const UNSUPPORTED_FILTER_PLACEHOLDER = 'placeholder'

export const renderFilter = (filter: FilterKey) => {
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
        default:
            return () => <div>{UNSUPPORTED_FILTER_PLACEHOLDER}</div>
    }
}

const getInitialActiveFilters = (
    optionalFilters: FilterKey[],
    cleanStatsFilters: StatsFilters
) =>
    optionalFilters.reduce<ActiveFilter[]>((filtersMap, filterKey) => {
        if (
            filterKey !== FilterKey.CustomFields &&
            filterKey !== FilterKey.Period
        ) {
            const filter = cleanStatsFilters[filterKey]
            return [
                ...filtersMap,
                {
                    key: filterKey,
                    type: filterKey,
                    active: filter !== undefined && filter.values.length > 0,
                },
            ]
        }
        return filtersMap
    }, [])

type CustomFieldFilter = {
    type: FilterKey.CustomFields
    key: string
    customFieldId: number
    filterName: string
    active: boolean
}

type ActiveFilter =
    | {
          key: string
          type: StaticFilter
          active: boolean
      }
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
        getInitialActiveFilters(optionalFilters, cleanStatsFilters)
    )

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
        })
    )

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
        [FilterKey.Period]: ComponentProps<typeof PeriodFilterWithState>
    }
) => {
    if (filterKey === String(FilterKey.Period)) {
        return settings?.[FilterKey.Period]
    }
    return undefined
}
