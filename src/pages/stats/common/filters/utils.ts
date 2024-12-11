import {AnalyticsFilter} from '@gorgias/api-queries'
import _isEqual from 'lodash/isEqual'
import times from 'lodash/times'

import {
    FilterComponentKey,
    FilterKey,
    SavedFilter,
    SavedFilterDraft,
} from 'models/stat/types'
import {FilterOptionGroup} from 'pages/stats/types'

export const getScoreLabelsAndValues = (
    maxScoreNumber: number,
    isDescending: boolean
) => {
    const labelsAndValues = times(maxScoreNumber, (index) => {
        const idx = index + 1
        const scoreValue = isDescending ? maxScoreNumber - idx + 1 : idx
        return {
            value: scoreValue.toString(),
            label:
                Array(scoreValue).fill('★').join('') +
                Array(maxScoreNumber - scoreValue)
                    .fill('☆')
                    .join(''),
        }
    })
    return labelsAndValues
}

export const getScoreLabelByValue = (
    scoreValue: number,
    maxScoreNumber: number
) => {
    return (
        Array(scoreValue).fill('★').join('') +
        Array(maxScoreNumber - scoreValue)
            .fill('☆')
            .join('')
    )
}

export const getFilterError = ({
    options,
    selectedOptions,
}: {
    selectedOptions?: FilterOptionGroup['options']
    options: FilterOptionGroup[]
}): {warningType?: 'non-existent'; warningMessage?: string} => {
    const nonExistentValues =
        (options.length &&
            selectedOptions
                ?.filter(
                    (selectedOption) =>
                        !options.some(
                            (group) =>
                                !group.options.length ||
                                group.options.some(
                                    (option) =>
                                        option.value === selectedOption.value
                                )
                        )
                )
                .map((selectedOption) => selectedOption.label)) ||
        []

    if (nonExistentValues.length === 1) {
        return {
            warningType: 'non-existent',
            warningMessage: `${nonExistentValues.join(', ')} no longer exists and has been removed from saved filters.`,
        }
    }
    if (nonExistentValues.length > 1) {
        return {
            warningType: 'non-existent',
            warningMessage: `${nonExistentValues.join(', ')} no longer exist and have been removed from saved filters.`,
        }
    }

    return {warningMessage: undefined, warningType: undefined}
}

export const getValidMemberName = (member: string): string => {
    switch (member) {
        case FilterComponentKey.Store:
        case FilterComponentKey.PhoneIntegrations:
            return FilterKey.Integrations
        case FilterComponentKey.CustomField:
            return FilterKey.CustomFields
        default:
            return member
    }
}

export const isFilterApplicable = ({
    filterKey,
    applicableFilters,
}: {
    filterKey: string
    applicableFilters: (FilterKey | FilterComponentKey)[]
}): 'not-applicable' | undefined => {
    if (
        applicableFilters.length &&
        !applicableFilters.find(
            (applicableFilter) =>
                getValidMemberName(applicableFilter) ===
                getValidMemberName(filterKey)
        )
    ) {
        return 'not-applicable'
    }
    return undefined
}

export const areFiltersApplicable = ({
    savedFilterDraft,
    applicableFilters,
}: {
    savedFilterDraft?: SavedFilterDraft | SavedFilter | null
    applicableFilters: (FilterKey | FilterComponentKey)[]
}): 'not-applicable' | undefined => {
    if (savedFilterDraft?.filter_group && applicableFilters.length) {
        const notApplicable = savedFilterDraft.filter_group.some(
            (filter) =>
                !applicableFilters.find(
                    (applicableFilter) =>
                        getValidMemberName(applicableFilter) ===
                        getValidMemberName(filter.member)
                )
        )
        if (notApplicable) {
            return 'not-applicable'
        }
    }
    return undefined
}

type MergedFiltersFormat =
    | {
          name: string
          filter_group: {
              member: string
              operator?: string
              values: (
                  | string
                  | number
                  | {
                        values: (string | number)[]
                        operator: string
                        customFieldId?: string
                    }
              )[]
          }[]
      }
    | undefined

export const getFormattedFilter = (
    filters: AnalyticsFilter | SavedFilterDraft | null | undefined
): MergedFiltersFormat =>
    filters
        ? {
              name: filters.name,
              filter_group: (filters.filter_group || []).map((group) => ({
                  member: group.member,
                  operator: 'operator' in group ? group.operator : undefined,
                  values: group.values.map((value) => {
                      return typeof value === 'object'
                          ? {
                                values: value.values,
                                operator: value.operator,
                                customFieldId:
                                    'custom_field_id' in value
                                        ? value.custom_field_id
                                        : undefined,
                            }
                          : value
                  }),
              })),
          }
        : undefined

export const areFiltersEqual = (
    savedFilters: AnalyticsFilter | null | undefined,
    filtersDraft: SavedFilterDraft | null | undefined
) =>
    _isEqual(getFormattedFilter(savedFilters), getFormattedFilter(filtersDraft))
