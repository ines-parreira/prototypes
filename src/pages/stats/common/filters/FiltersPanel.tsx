import {useFlags} from 'launchdarkly-react-client-sdk'
import _isEqual from 'lodash/isEqual'
import React, {
    ComponentProps,
    ComponentType,
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {connect} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppSelector from 'hooks/useAppSelector'
import usePrevious from 'hooks/usePrevious'
import {
    FilterComponentKey,
    FilterKey,
    StaticFilter,
    StatsFiltersWithLogicalOperator,
    TagFilterInstanceId,
} from 'models/stat/types'
import {AddFilterButton} from 'pages/stats/common/filters/AddFilterButton'
import {ChannelsFilterWithState} from 'pages/stats/common/filters/ChannelsFilter'
import {AUTO_QA_FILTER_KEYS} from 'pages/stats/common/filters/constants'
import {CustomFieldFilter} from 'pages/stats/common/filters/CustomFieldFilter'
import css from 'pages/stats/common/filters/FiltersPanel.less'
import {FilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {
    activeFiltersToOptions,
    filterKeyToStateKeyMapper,
    getFilteredFilterComponentKeys,
    getFilterSettings,
} from 'pages/stats/common/filters/helpers'
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'
import {isFilterApplicable} from 'pages/stats/common/filters/utils'
import {
    activeParams,
    selectDropdownTextFields,
} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {getHasAutomate} from 'state/billing/selectors'
import {RootState} from 'state/types'
import {getCleanStatsFiltersWithLogicalOperators} from 'state/ui/stats/selectors'

export type OptionalFilter = FilterKey | FilterComponentKey.PhoneIntegrations

type FilterSettingOverrides = {
    [FilterKey.Period]?: Omit<
        ComponentProps<typeof PeriodFilterWithState>,
        'value'
    >
    [FilterKey.Channels]?: Omit<
        ComponentProps<typeof ChannelsFilterWithState>,
        'value'
    >
}

export type FiltersPanelProps = {
    warning?: 'not-applicable' | 'non-existent' | undefined
    shouldHideFilters?: boolean
    persistentFilters?: StaticFilter[]
    optionalFilters?: OptionalFilter[]
    applicableFilters?: (StaticFilter | OptionalFilter)[]
    filterSettingsOverrides?: FilterSettingOverrides
    cleanStatsFilters: StatsFiltersWithLogicalOperator
    filterComponentMap: Record<
        FilterKey | FilterComponentKey,
        ComponentType<any>
    >
}

export function isFilterTypeWithValues(
    type: FilterKey | FilterComponentKey
): type is Exclude<
    FilterKey | FilterComponentKey,
    | FilterKey.CustomFields
    | FilterKey.Period
    | FilterKey.AggregationWindow
    | FilterComponentKey.CustomField
    | FilterComponentKey.Store
    | FilterComponentKey.BusiestTimesMetricSelectFilter
    | FilterComponentKey.PhoneIntegrations
> {
    return (
        type !== FilterKey.AggregationWindow &&
        type !== FilterKey.CustomFields &&
        type !== FilterKey.Tags &&
        type !== FilterKey.Period &&
        type !== FilterComponentKey.CustomField &&
        type !== FilterComponentKey.Store &&
        type !== FilterComponentKey.BusiestTimesMetricSelectFilter &&
        type !== FilterComponentKey.PhoneIntegrations
    )
}

const getActiveFilters = (
    optionalFilters: (FilterKey | FilterComponentKey)[],
    cleanStatsFilters: StatsFiltersWithLogicalOperator
) => {
    const filterComponentKeys = getFilteredFilterComponentKeys(optionalFilters)
    return filterComponentKeys.reduce<ActiveFilter[]>((arr, filterKey) => {
        if (
            filterKey !== FilterKey.CustomFields &&
            filterKey !== FilterKey.Tags &&
            filterKey !== FilterKey.AggregationWindow &&
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
        } else if (filterKey === FilterKey.Tags) {
            const filter = cleanStatsFilters[FilterKey.Tags]
            const firstInstance = filter?.find(
                (instance) =>
                    instance.filterInstanceId === TagFilterInstanceId.First
            )
            const secondInstance = filter?.find(
                (instance) =>
                    instance.filterInstanceId === TagFilterInstanceId.Second
            )
            return [
                ...arr,
                {
                    key: `${filterKey}-first`,
                    type: filterKey,
                    active:
                        firstInstance !== undefined &&
                        firstInstance.values.length > 0,
                    initializeAsOpen: false,
                    filterInstanceId: TagFilterInstanceId.First,
                },
                {
                    key: `${filterKey}-second`,
                    type: filterKey,
                    active:
                        secondInstance !== undefined &&
                        secondInstance.values.length > 0,
                    initializeAsOpen: false,
                    filterInstanceId: TagFilterInstanceId.Second,
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

type TagFilter = FilterComponent & {
    type: FilterKey.Tags
    filterInstanceId: TagFilterInstanceId
}

export type ActiveFilter =
    | (FilterComponent & {
          type: StaticFilter
      })
    | CustomFieldFilter
    | TagFilter

const useCustomFieldFilters = (
    cleanStatsFilters: StatsFiltersWithLogicalOperator
): CustomFieldFilter[] => {
    const isAnalyticsCustomFieldsFilter =
        !!useFlags()[FeatureFlagKey.AnalyticsCustomFieldsFilter]
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)
    const activeDropdownFields = activeFields.filter(selectDropdownTextFields)

    return isAnalyticsCustomFieldsFilter
        ? activeDropdownFields.map((field) => ({
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
          }))
        : []
}

export const FiltersPanelComponent = ({
    persistentFilters = [],
    optionalFilters: initialOptionalFilters = [],
    applicableFilters = [],
    filterSettingsOverrides,
    cleanStatsFilters,
    filterComponentMap,
    shouldHideFilters,
}: FiltersPanelProps) => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const optionalFilters = useMemo(() => {
        if (shouldHideFilters) return []

        let filters = [...initialOptionalFilters]
        if (!hasAutomate) {
            filters = filters.filter(
                (filter) =>
                    !AUTO_QA_FILTER_KEYS.find(
                        (autoQAFilter) => autoQAFilter === filter
                    )
            )
        }

        return filters
    }, [initialOptionalFilters, shouldHideFilters, hasAutomate])

    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
        getActiveFilters(optionalFilters, cleanStatsFilters)
    )

    const previousCleanStatsFilters = usePrevious(cleanStatsFilters)
    const customFieldFilters = useCustomFieldFilters(cleanStatsFilters)

    useEffect(() => {
        if (!optionalFilters.length && activeFilters.length) {
            setActiveFilters(
                getActiveFilters(optionalFilters, cleanStatsFilters)
            )
        }
    }, [activeFilters.length, cleanStatsFilters, optionalFilters])

    useEffect(() => {
        const newFilters = optionalFilters.filter((filter) => {
            if (
                filter !== FilterKey.CustomFields &&
                filter !== FilterKey.Tags &&
                filter !== FilterKey.Period
            ) {
                return (
                    activeFilters.find(
                        (activeFilter) => activeFilter.key === filter
                    ) === undefined
                )
            } else if (filter === FilterKey.Tags) {
                return (
                    activeFilters.filter(
                        (activeFilter) => activeFilter.type === FilterKey.Tags
                    ).length < 2
                )
            }
            return false
        })

        const updatedActiveFilters = activeFilters.map((filter) => {
            if (filter.type === FilterKey.CustomFields) {
                const getCustomFieldFilter = customFieldFilters.find(
                    (customFieldFilter) =>
                        customFieldFilter.customFieldId === filter.customFieldId
                )
                return {
                    ...filter,
                    initializeAsOpen: false,
                    active:
                        getCustomFieldFilter !== undefined &&
                        getCustomFieldFilter.active,
                }
            }
            if (filter.type === FilterKey.Tags) {
                const getTagsFilterByInstanceId = (
                    instanceId: TagFilterInstanceId
                ) => {
                    return cleanStatsFilters[FilterKey.Tags]?.find(
                        (instance) => instance.filterInstanceId === instanceId
                    )
                }

                return {
                    ...filter,
                    initializeAsOpen: false,
                    active:
                        (
                            getTagsFilterByInstanceId(filter.filterInstanceId)
                                ?.values ?? []
                        ).length > 0,
                }
            }
            if (
                isFilterTypeWithValues(filter.type) &&
                (cleanStatsFilters[filter.type]?.values ?? []).length > 0 &&
                !filter.active
            ) {
                return {...filter, active: true}
            }
            if (
                isFilterTypeWithValues(filter.type) &&
                (cleanStatsFilters[filter.type]?.values ?? []).length === 0 &&
                !filter.initializeAsOpen
            ) {
                return {...filter, active: false}
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
        customFieldFilters,
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

    const optionalFiltersToRender = useMemo(
        () => activeFilters.filter((filter) => filter.active),
        [activeFilters]
    )
    const persistentFiltersToRender: ActiveFilter[] = persistentFilters.map(
        (filter) => ({
            key: filter,
            type: filter,
            active: true,
            initializeAsOpen: false,
        })
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

    const createFilterElement = useCallback(
        (filter: ActiveFilter) =>
            createElement(filterComponentMap[filter.type], {
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
                filterInstanceId:
                    filter.type === FilterKey.Tags
                        ? filter?.filterInstanceId
                        : undefined,
                warningType: isFilterApplicable({
                    filterKey: filter.type,
                    applicableFilters,
                }),
                ...getFilterSettings(filter.key, filterSettingsOverrides),
            }),
        [
            activeFilters,
            filterComponentMap,
            filterSettingsOverrides,
            setActiveFilters,
            applicableFilters,
        ]
    )

    const options = useMemo(
        () => activeFiltersToOptions(activeFilters),
        [activeFilters]
    )

    return (
        <div className={css.wrapper}>
            {persistentFiltersToRender.map(createFilterElement)}
            {persistentFiltersToRender.length > 0 &&
                optionalFiltersToRender.length > 0 && (
                    <span className={css.divider} />
                )}
            {optionalFiltersToRender.map(createFilterElement)}
            {options.length > 0 && (
                <AddFilterButton
                    optionGroups={options}
                    onClick={handleOnClick}
                    isDisabled={shouldHideFilters}
                />
            )}
        </div>
    )
}

export const FiltersPanel = connect((state: RootState) => ({
    cleanStatsFilters: getCleanStatsFiltersWithLogicalOperators(state),
    filterComponentMap: FilterComponentMap,
}))(FiltersPanelComponent)
