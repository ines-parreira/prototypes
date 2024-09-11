import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {
    ComponentProps,
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import _isEqual from 'lodash/isEqual'
import {FeatureFlagKey} from 'config/featureFlags'
import {SLAPolicyFilterWithState} from 'pages/stats/common/filters/SLAPolicyFilter'
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
import {
    IntegrationsFilterWithState,
    PhoneIntegrationsFilterWithState,
} from 'pages/stats/common/filters/IntegrationsFilter'
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'
import {HelpCenterFilterWithState} from 'pages/stats/common/filters/HelpCenterFilter'
import {HelpCenterLanguageFilterWithState} from 'pages/stats/common/filters/HelpCenterLanguageFilter'
import {StoreFilterFromContext} from 'pages/stats/common/filters/StoreFilter'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/CustomFieldSelect'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'
import {CustomFieldFilter} from 'pages/stats/common/filters/CustomFieldFilter'
import usePrevious from 'hooks/usePrevious'
import {
    filterKeyToStateKeyMapper,
    getFilteredFilterComponentKeys,
} from 'pages/stats/common/filters/helpers'
import {CampaignsFilterFromContext} from 'pages/stats/common/filters/CampaignsFilter'
import {CampaignStatusesFilterFromContext} from 'pages/stats/convert/components/CampaignStatusesFilter'

type Props = {
    persistentFilters?: StaticFilter[]
    optionalFilters?: (FilterKey | FilterComponentKey)[]
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
        case FilterComponentKey.PhoneIntegrations:
            return PhoneIntegrationsFilterWithState
        case FilterKey.Agents:
            return AgentsFiltersWithState
        case FilterKey.Tags:
            return TagsFilterWithState
        case FilterKey.HelpCenters:
            return HelpCenterFilterWithState
        case FilterKey.LocaleCodes:
            return HelpCenterLanguageFilterWithState
        case FilterKey.SlaPolicies:
            return SLAPolicyFilterWithState
        case FilterComponentKey.BusiestTimesMetricSelectFilter:
            return BusiestTimesMetricSelectFilter
        case FilterComponentKey.CustomField:
            return CustomFieldFilter
        case FilterKey.Campaigns:
            return CampaignsFilterFromContext
        case FilterKey.CampaignStatuses:
            return CampaignStatusesFilterFromContext
        case FilterComponentKey.Store:
            return StoreFilterFromContext
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
    | FilterComponentKey.PhoneIntegrations
> {
    return (
        type !== FilterKey.CustomFields &&
        type !== FilterKey.Period &&
        type !== FilterComponentKey.CustomField &&
        type !== FilterComponentKey.Store &&
        type !== FilterComponentKey.BusiestTimesMetricSelectFilter &&
        type !== FilterComponentKey.PhoneIntegrations
    )
}

const getActiveFilters = (
    optionalFilters: (FilterKey | FilterComponentKey)[],
    cleanStatsFilters: StatsFilters
) => {
    const filterComponentKeys = getFilteredFilterComponentKeys(optionalFilters)
    return filterComponentKeys.reduce<ActiveFilter[]>((arr, filterKey) => {
        if (
            filterKey !== FilterKey.CustomFields &&
            filterKey !== FilterKey.Period
        ) {
            const filter =
                cleanStatsFilters[filterKeyToStateKeyMapper(filterKey)]
            return [
                ...arr,
                {
                    key: filterKey,
                    type: filterKey,
                    active: filter !== undefined && filter.values.length > 0,
                    initializeAsOpen: false,
                },
            ]
        }
        return arr
    }, [])
}

type FilterComponent = {
    key: string
    active: boolean
    initializeAsOpen: boolean
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
    const isAnalyticsCustomFieldsFilter =
        !!useFlags()[FeatureFlagKey.AnalyticsCustomFieldsFilter]
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
            active:
                (
                    cleanStatsFilters[FilterKey.CustomFields]?.find(
                        (filter) => filter.customFieldId === field.id
                    )?.values ?? []
                ).length > 0,
            initializeAsOpen: false,
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
            isAnalyticsCustomFieldsFilter &&
            optionalFilters.includes(FilterKey.CustomFields) &&
            customFieldFilters.length > 0 &&
            !activeFilters.find(
                (filter) => filter.type === FilterKey.CustomFields
            )
        ) {
            setActiveFilters([...activeFilters, ...customFieldFilters])
        }
    }, [
        activeFilters,
        customFieldFilters,
        isAnalyticsCustomFieldsFilter,
        optionalFilters,
    ])

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
        .sort((a, b) => (a.label < b.label ? -1 : 1))
        .sort((a, b) => {
            if (
                a.type !== FilterKey.CustomFields &&
                b.type === FilterKey.CustomFields
            ) {
                return -1
            }
            return 0
        })

    const optionalFiltersToRender = useMemo(
        () => activeFilters.filter((filter) => filter.active),
        [activeFilters]
    )

    const handleOnClick = useCallback(
        (value: string) =>
            setActiveFilters((prevFilters) => {
                const filtersWithoutTheSelectedOne = prevFilters.filter(
                    (filter) => filter.key !== value
                )
                const filterToUpdate = prevFilters.find(
                    (filter) => filter.key === value
                )

                if (filterToUpdate) {
                    filtersWithoutTheSelectedOne.push({
                        ...filterToUpdate,
                        active: !filterToUpdate.active,
                        initializeAsOpen: true,
                    })
                }
                return filtersWithoutTheSelectedOne
            }),
        []
    )

    const filtersToRender: ActiveFilter[] = [
        ...persistentFilters.map((filter) => ({
            key: filter,
            type: filter,
            active: true,
            initializeAsOpen: false,
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
                    initializeAsOpen: filter.initializeAsOpen,
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
