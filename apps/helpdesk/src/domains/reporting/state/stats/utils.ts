import moment from 'moment/moment'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type {
    AggregationWindow,
    CustomFieldFilter,
    CustomFieldSavedFilter,
    LegacyStatsFilters,
    Period,
    SavedFilterCustomFieldFilter,
    SavedFilterDraft,
    SavedFilterSupportedFilters,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import {
    FilterKey,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const getCustomFields = (statsFilters: Partial<LegacyStatsFilters>) => {
    const customFieldFilters: Record<string, CustomFieldFilter> = {}
    const filterValues = statsFilters[FilterKey.CustomFields]

    if (filterValues !== undefined) {
        filterValues.forEach((filter) => {
            const customFieldId = filter.slice(0, filter.indexOf(':'))
            const value = filter.slice(filter.indexOf(':') + 2)
            if (customFieldFilters[customFieldId]) {
                customFieldFilters[customFieldId].values.push(value)
            }
            customFieldFilters[customFieldId] = {
                customFieldId: Number(customFieldId),
                values: customFieldFilters[customFieldId]?.values || [value],
                operator: LogicalOperatorEnum.ONE_OF,
            }
        })
    }
    return Object.values(customFieldFilters)
}

export const fromPartialLegacyStatsFilters = (
    statsFilters: Partial<LegacyStatsFilters>,
): Partial<StatsFiltersWithLogicalOperator> => {
    const filterKeys = Object.values(FilterKey)
    return filterKeys.reduce<Partial<StatsFiltersWithLogicalOperator>>(
        (acc, key) => {
            switch (key) {
                case FilterKey.Period:
                    acc[key] = statsFilters[key]
                    break
                case FilterKey.AggregationWindow:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = statsFilters[key]
                    }
                    break
                case FilterKey.Tags:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = [
                            {
                                ...withDefaultLogicalOperator(
                                    statsFilters[key],
                                ),
                                filterInstanceId: TagFilterInstanceId.First,
                            },
                        ]
                    }
                    break
                case FilterKey.Integrations:
                case FilterKey.StoreIntegrations:
                case FilterKey.Stores:
                case FilterKey.AssignedTeam:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                case FilterKey.VoiceQueues:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
                    break
                case FilterKey.CustomFields:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = getCustomFields(statsFilters)
                    }
                    break
                case FilterKey.Handover:
                    break
                default:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
            }
            return acc
        },
        {},
    )
}

export const fromLegacyStatsFilters = (
    statsFilters: LegacyStatsFilters,
): StatsFiltersWithLogicalOperator => {
    const filterKeys = Object.values(FilterKey)
    return filterKeys.reduce<StatsFiltersWithLogicalOperator>(
        (acc, key) => {
            switch (key) {
                case FilterKey.Period:
                    acc[key] = statsFilters[key]
                    break
                case FilterKey.Tags:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = [
                            {
                                ...withDefaultLogicalOperator(
                                    statsFilters[key],
                                ),
                                filterInstanceId: TagFilterInstanceId.First,
                            },
                        ]
                    }
                    break
                case FilterKey.AggregationWindow:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = statsFilters[key]
                    }
                    break
                case FilterKey.Integrations:
                case FilterKey.StoreIntegrations:
                case FilterKey.Stores:
                case FilterKey.AssignedTeam:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                case FilterKey.VoiceQueues:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
                    break
                case FilterKey.CustomFields:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = getCustomFields(statsFilters)
                    }
                    break
                case FilterKey.Handover:
                    break
                default:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
            }
            return acc
        },
        {
            period: statsFilters.period,
        },
    )
}

export const fromFiltersWithLogicalOperators = (
    statsFilters: StatsFiltersWithLogicalOperator,
): LegacyStatsFilters => {
    return {
        period: statsFilters[FilterKey.Period],
        ...Object.values(FilterKey).reduce<Partial<LegacyStatsFilters>>(
            (acc, filter) => {
                switch (filter) {
                    case FilterKey.Period:
                        acc[filter] = statsFilters[filter]
                        break
                    case FilterKey.Tags:
                        if (statsFilters[filter] !== undefined) {
                            acc[filter] = (statsFilters[filter] ?? []).find(
                                (tagFilter) =>
                                    tagFilter.operator ===
                                    LogicalOperatorEnum.ONE_OF,
                            )?.values
                        }
                        break
                    case FilterKey.AggregationWindow:
                        if (statsFilters[filter] !== undefined) {
                            acc[filter] = statsFilters[filter]
                        }
                        break
                    case FilterKey.StoreIntegrations:
                    case FilterKey.Stores:
                    case FilterKey.AssignedTeam:
                    case FilterKey.Integrations:
                    case FilterKey.Agents:
                    case FilterKey.HelpCenters:
                    case FilterKey.VoiceQueues:
                        if (statsFilters[filter]?.values !== undefined) {
                            acc[filter] = statsFilters[filter]?.values
                        }
                        break
                    case FilterKey.CustomFields:
                        if (
                            statsFilters[filter] !== undefined &&
                            (statsFilters[filter]?.length ?? 0) > 0
                        ) {
                            acc[filter] = statsFilters[filter]?.reduce<
                                string[]
                            >((accumulator, value) => {
                                if (value.values) {
                                    accumulator.push(...value.values)
                                }
                                return accumulator
                            }, [])
                        }
                        break
                    case FilterKey.Handover:
                        break
                    default:
                        if (statsFilters[filter]?.values !== undefined) {
                            acc[filter] = statsFilters[filter]?.values
                        }
                }
                return acc
            },
            {},
        ),
    }
}

export const excludeFromFiltersWithLogicalOperators = (
    statsFilters: StatsFiltersWithLogicalOperator,
    filtersToExclude: Exclude<FilterKey, FilterKey.Period>[],
): StatsFiltersWithLogicalOperator => {
    return Object.values(FilterKey).reduce<StatsFiltersWithLogicalOperator>(
        (acc, key) => {
            if (!filtersToExclude.map(String).includes(key)) {
                switch (key) {
                    case FilterKey.Period:
                        acc[key] = statsFilters[key]
                        break
                    case FilterKey.AggregationWindow:
                        acc[key] = statsFilters[key]
                        break
                    case FilterKey.Tags:
                        acc[key] = statsFilters[key]
                        break
                    case FilterKey.Integrations:
                    case FilterKey.StoreIntegrations:
                    case FilterKey.Stores:
                    case FilterKey.AssignedTeam:
                    case FilterKey.Agents:
                    case FilterKey.HelpCenters:
                    case FilterKey.VoiceQueues:
                        acc[key] = statsFilters[key]
                        break
                    case FilterKey.CustomFields:
                        acc[key] = statsFilters[key]
                        break
                    default:
                        acc[key] = statsFilters[key]
                }
            }

            return acc
        },
        {
            period: statsFilters.period,
        },
    )
}

export const savedFilterDraftFiltersFromFiltersWithLogicalOperators = (
    statsFilters: StatsFiltersWithLogicalOperator,
): SavedFilterDraft['filter_group'] =>
    Object.values(FilterKey).reduce<SavedFilterDraft['filter_group']>(
        (acc, filter) => {
            switch (filter) {
                case FilterKey.Period:
                case FilterKey.AggregationWindow:
                case FilterKey.JourneyType:
                case FilterKey.JourneyFlows:
                case FilterKey.JourneyCampaigns:
                case FilterKey.Handover:
                case FilterKey.StoreIntegrations:
                    break
                case FilterKey.Tags: {
                    const currentFilter = statsFilters[filter]
                    if (currentFilter !== undefined) {
                        acc.push({
                            member: filter,
                            values: currentFilter.map((tagFilter) => ({
                                operator: tagFilter.operator,
                                values: tagFilter.values.map(String),
                                filterInstanceId: tagFilter.filterInstanceId,
                            })),
                        })
                    }
                    break
                }
                case FilterKey.CustomFields: {
                    const currentFilter = statsFilters[filter]
                    if (
                        currentFilter !== undefined &&
                        currentFilter.length > 0
                    ) {
                        acc.push({
                            member: filter,
                            values: currentFilter.reduce<
                                SavedFilterCustomFieldFilter[]
                            >((accumulator, value) => {
                                accumulator.push({
                                    custom_field_id: String(
                                        value.customFieldId,
                                    ),
                                    values: value.values,
                                    operator: value.operator,
                                })
                                return accumulator
                            }, []),
                        })
                    }
                    break
                }
                default: {
                    const currentFilter = statsFilters[filter]
                    if (currentFilter !== undefined) {
                        acc.push({
                            member: filter,
                            operator: currentFilter.operator,
                            values: currentFilter.values.map(String),
                        })
                    }
                }
            }
            return acc
        },
        [],
    )

export const statsFiltersWithLogicalOperatorsFromSavedFilters = (
    filters: SavedFilterDraft['filter_group'] | undefined,
): Omit<StatsFiltersWithLogicalOperator, 'period'> =>
    filters === undefined
        ? {}
        : filters.reduce<Omit<StatsFiltersWithLogicalOperator, 'period'>>(
              (statsFilters, savedFilter) => {
                  if (savedFilter.member === FilterKey.CustomFields) {
                      statsFilters[savedFilter.member] = savedFilter.values.map(
                          (v) => ({
                              ...v,
                              customFieldId: Number(v.custom_field_id),
                          }),
                      )
                  } else if (savedFilter.member === FilterKey.Tags) {
                      statsFilters[savedFilter.member] = savedFilter.values.map(
                          (filter) => ({
                              ...filter,
                              operator: filter.operator,
                              values: filter.values.map(Number),
                              filterInstanceId: filter.filterInstanceId,
                          }),
                      )
                  } else if (
                      savedFilter.member === FilterKey.HelpCenters ||
                      savedFilter.member === FilterKey.Integrations ||
                      savedFilter.member === FilterKey.Agents ||
                      savedFilter.member === FilterKey.AssignedTeam ||
                      savedFilter.member === FilterKey.VoiceQueues ||
                      savedFilter.member === FilterKey.Stores
                  ) {
                      statsFilters[savedFilter.member] = {
                          operator: savedFilter.operator,
                          values: savedFilter.values.map(Number),
                      }
                  } else {
                      statsFilters[savedFilter.member] = {
                          operator: savedFilter.operator,
                          values: savedFilter.values,
                      }
                  }

                  return statsFilters
              },
              {},
          )

export const getAllowedAggregationWindows = (
    period: Period,
): AggregationWindow[] => {
    const periodInDays = Math.abs(
        moment
            .duration(
                moment(period.start_datetime)
                    .startOf('day')
                    .diff(moment(period.end_datetime).endOf('day')),
            )
            .asDays(),
    )
    const isLessThenADay = periodInDays <= 1
    const isUpTo92days = periodInDays <= 92
    if (isLessThenADay) {
        return [ReportingGranularity.Hour]
    } else if (isUpTo92days) {
        return [
            ReportingGranularity.Day,
            ReportingGranularity.Week,
            ReportingGranularity.Month,
        ]
    }
    return [ReportingGranularity.Week, ReportingGranularity.Month]
}

export const getAdjustedAggregationWindow = (
    filters: StatsFilters,
): StatsFilters[FilterKey.AggregationWindow] => {
    if (filters.aggregationWindow === undefined) {
        return undefined
    }

    const allowedAggregations = getAllowedAggregationWindows(filters.period)
    return allowedAggregations.includes(filters.aggregationWindow)
        ? filters.aggregationWindow
        : allowedAggregations[0]
}

export const isCustomFieldSavedFilter = (
    filter: SavedFilterSupportedFilters,
): filter is CustomFieldSavedFilter => filter.member === FilterKey.CustomFields
