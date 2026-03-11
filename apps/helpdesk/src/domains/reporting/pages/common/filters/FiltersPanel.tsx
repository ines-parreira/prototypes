import type { ComponentProps, ComponentType } from 'react'
import React, {
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { usePrevious } from '@repo/hooks'
import _isEqual from 'lodash/isEqual'
import { connect } from 'react-redux'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type {
    StaticFilter,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import {
    FilterComponentKey,
    FilterKey,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { AddFilterButton } from 'domains/reporting/pages/common/filters/AddFilterButton'
import type { ChannelsFilterWithState } from 'domains/reporting/pages/common/filters/ChannelsFilter'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import type { CustomFieldFilter } from 'domains/reporting/pages/common/filters/CustomFieldFilter'
import css from 'domains/reporting/pages/common/filters/FiltersPanel.less'
import { FilterComponentMap } from 'domains/reporting/pages/common/filters/FiltersPanelConfig'
import {
    activeFiltersToOptions,
    filterKeyToStateKeyMapper,
    getFilteredFilterComponentKeys,
    getFilterSettings,
} from 'domains/reporting/pages/common/filters/helpers'
import type { PeriodFilterWithState } from 'domains/reporting/pages/common/filters/PeriodFilter'
import { isFilterApplicable } from 'domains/reporting/pages/common/filters/utils'
import {
    activeParams,
    selectDropdownTextFields,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { getCleanStatsFiltersWithLogicalOperators } from 'domains/reporting/state/ui/stats/selectors'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'

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
    compact?: boolean
}

export function isFilterTypeWithValues(
    type: FilterKey | FilterComponentKey,
): type is Exclude<
    FilterKey | FilterComponentKey,
    | FilterKey.CustomFields
    | FilterKey.Period
    | FilterKey.AggregationWindow
    | FilterKey.StoreIntegrations
    | FilterKey.Stores
    | FilterKey.AssignedTeam
    | FilterComponentKey.CustomField
    | FilterComponentKey.BusiestTimesMetricSelectFilter
    | FilterComponentKey.PhoneIntegrations
> {
    return (
        type !== FilterKey.AggregationWindow &&
        type !== FilterKey.CustomFields &&
        type !== FilterKey.Tags &&
        type !== FilterKey.Period &&
        type !== FilterKey.StoreIntegrations &&
        type !== FilterKey.Stores &&
        type !== FilterKey.AssignedTeam &&
        type !== FilterComponentKey.CustomField &&
        type !== FilterComponentKey.BusiestTimesMetricSelectFilter &&
        type !== FilterComponentKey.PhoneIntegrations
    )
}

const getActiveFilters = (
    optionalFilters: (FilterKey | FilterComponentKey)[],
    cleanStatsFilters: StatsFiltersWithLogicalOperator,
) => {
    const filterComponentKeys = getFilteredFilterComponentKeys(optionalFilters)
    return filterComponentKeys.reduce<ActiveFilter[]>((arr, filterKey) => {
        if (
            filterKey !== FilterKey.CustomFields &&
            filterKey !== FilterKey.Tags &&
            filterKey !== FilterKey.AggregationWindow &&
            filterKey !== FilterKey.JourneyType &&
            filterKey !== FilterKey.JourneyFlows &&
            filterKey !== FilterKey.JourneyCampaigns &&
            filterKey !== FilterKey.Handover &&
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
                    instance.filterInstanceId === TagFilterInstanceId.First,
            )
            const secondInstance = filter?.find(
                (instance) =>
                    instance.filterInstanceId === TagFilterInstanceId.Second,
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
    cleanStatsFilters: StatsFiltersWithLogicalOperator,
): CustomFieldFilter[] => {
    const { data: { data: activeFields = [] } = {} } =
        useCustomFieldDefinitions(activeParams)
    const activeDropdownFields = activeFields.filter(selectDropdownTextFields)

    return activeDropdownFields.map((field) => ({
        type: FilterKey.CustomFields,
        key: `${FilterKey.CustomFields}::${field.id}`,
        filterName: field.label,
        customFieldId: field.id,
        active:
            (
                cleanStatsFilters[FilterKey.CustomFields]?.find(
                    (filter) => filter.customFieldId === field.id,
                )?.values ?? []
            ).length > 0,
        initializeAsOpen: false,
    }))
}

export const FiltersPanelComponent = ({
    persistentFilters = [],
    optionalFilters: initialOptionalFilters = [],
    applicableFilters = [],
    filterSettingsOverrides,
    cleanStatsFilters,
    filterComponentMap,
    shouldHideFilters,
    compact = false,
}: FiltersPanelProps) => {
    const { hasAccess } = useAiAgentAccess()
    const optionalFilters = useMemo(() => {
        if (shouldHideFilters) return []

        let filters = [...initialOptionalFilters]
        if (!hasAccess) {
            filters = filters.filter(
                (filter) =>
                    !AUTO_QA_FILTER_KEYS.find(
                        (autoQAFilter) => autoQAFilter === filter,
                    ),
            )
        }

        return filters
    }, [hasAccess, initialOptionalFilters, shouldHideFilters])

    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
        getActiveFilters(optionalFilters, cleanStatsFilters),
    )

    const previousCleanStatsFilters = usePrevious(cleanStatsFilters)
    const customFieldFilters = useCustomFieldFilters(cleanStatsFilters)

    const isDuringBusinessHoursEnabled = useFlag(
        FeatureFlagKey.VoiceCallDuringBusinessHours,
    )

    useEffect(() => {
        if (!optionalFilters.length && activeFilters.length) {
            setActiveFilters(
                getActiveFilters(optionalFilters, cleanStatsFilters),
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
                        (activeFilter) => activeFilter.key === filter,
                    ) === undefined
                )
            } else if (filter === FilterKey.Tags) {
                return (
                    activeFilters.filter(
                        (activeFilter) => activeFilter.type === FilterKey.Tags,
                    ).length < 2
                )
            }
            return false
        })

        const updatedActiveFilters = activeFilters.map((filter) => {
            if (filter.type === FilterKey.CustomFields) {
                const getCustomFieldFilter = customFieldFilters.find(
                    (customFieldFilter) =>
                        customFieldFilter.customFieldId ===
                        filter.customFieldId,
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
                    instanceId: TagFilterInstanceId,
                ) => {
                    return cleanStatsFilters[FilterKey.Tags]?.find(
                        (instance) => instance.filterInstanceId === instanceId,
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
                return { ...filter, active: true }
            }
            if (
                isFilterTypeWithValues(filter.type) &&
                (cleanStatsFilters[filter.type]?.values ?? []).length === 0 &&
                !filter.initializeAsOpen
            ) {
                return { ...filter, active: false }
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
                cleanStatsFilters,
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
                (filter) => filter.type === FilterKey.CustomFields,
            )
        ) {
            setActiveFilters([...activeFilters, ...customFieldFilters])
        }
    }, [activeFilters, customFieldFilters, optionalFilters])

    const optionalFiltersToRender = useMemo(
        () => activeFilters.filter((filter) => filter.active),
        [activeFilters],
    )
    const persistentFiltersToRender: ActiveFilter[] = persistentFilters.map(
        (filter) => ({
            key: filter,
            type: filter,
            active: true,
            initializeAsOpen: false,
        }),
    )

    const handleOnClick = useCallback(
        (value: string) =>
            setActiveFilters((prevFilters) => {
                const filtersWithoutTheSelectedOne = prevFilters.filter(
                    (filter) => filter.key !== value,
                )
                const filterToUpdate = prevFilters.find(
                    (filter) => filter.key === value,
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
        [],
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
                        }),
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
                compact,
                ...getFilterSettings(filter.key, filterSettingsOverrides),
            }),
        [
            activeFilters,
            filterComponentMap,
            filterSettingsOverrides,
            setActiveFilters,
            applicableFilters,
            compact,
        ],
    )

    const options = useMemo(
        () =>
            activeFiltersToOptions(
                isDuringBusinessHoursEnabled
                    ? activeFilters
                    : activeFilters.filter(
                          (filter) =>
                              filter.type !== FilterKey.IsDuringBusinessHours,
                      ),
            ),
        [activeFilters, isDuringBusinessHoursEnabled],
    )

    return (
        <div className={compact ? css.wrapperCompact : css.wrapper}>
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
