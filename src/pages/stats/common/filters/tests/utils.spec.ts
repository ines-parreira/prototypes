import {
    FilterComponentKey,
    FilterKey,
    SavedFilter,
    SavedFilterDraft,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
    getFilterError,
    getValidMemberName,
    isFilterApplicable,
    areFiltersApplicable,
    createFilterOptions,
    filterValidOptions,
    NON_EXISTENT_VALUES_WARNING_MESSAGE,
} from 'pages/stats/common/filters/utils'

describe('utils', () => {
    describe('getScoreLabelsAndValues', () => {
        it('should return array of score labels and values in ascending order', () => {
            const result = getScoreLabelsAndValues(3, false)
            expect(result).toEqual([
                {
                    value: '1',
                    label: '★☆☆',
                },
                {
                    value: '2',
                    label: '★★☆',
                },
                {
                    value: '3',
                    label: '★★★',
                },
            ])
        })
        it('should return array of score labels and values in descending order', () => {
            const result = getScoreLabelsAndValues(5, true)
            expect(result).toEqual([
                {
                    value: '5',
                    label: '★★★★★',
                },
                {
                    value: '4',
                    label: '★★★★☆',
                },
                {
                    value: '3',
                    label: '★★★☆☆',
                },
                {
                    value: '2',
                    label: '★★☆☆☆',
                },
                {
                    value: '1',
                    label: '★☆☆☆☆',
                },
            ])
        })
    })

    describe('getScoreLabelByValue', () => {
        it('should return a label for a given score value', () => {
            expect(getScoreLabelByValue(1, 3)).toEqual('★☆☆')
            expect(getScoreLabelByValue(2, 3)).toEqual('★★☆')
            expect(getScoreLabelByValue(3, 3)).toEqual('★★★')
        })
    })
})

describe('getFilterError', () => {
    const mockOptions = [
        {
            options: [
                {label: 'Option 1', value: 'option1'},
                {label: 'Option 2', value: 'option2'},
            ],
        },
        {
            options: [
                {label: 'Option 3', value: 'option3'},
                {label: 'Option 4', value: 'option4'},
            ],
        },
    ]

    it('should return undefined when all selected options exist in the available options', () => {
        const selectedOptions = [
            {label: 'Option 1', value: 'option1'},
            {label: 'Option 3', value: 'option3'},
        ]

        const result = getFilterError({
            options: mockOptions,
            selectedOptions,
        })

        expect(result).toEqual({
            warningMessage: undefined,
            warningType: undefined,
        })
    })

    it('should return error message when one selected option does not exist', () => {
        const selectedOptions = [
            {label: 'Option 1', value: 'option1'},
            {label: 'Option 5', value: 'option5'},
        ]

        const result = getFilterError({
            options: mockOptions,
            selectedOptions,
        })

        expect(result).toEqual({
            warningType: 'non-existent',
            warningMessage: NON_EXISTENT_VALUES_WARNING_MESSAGE,
        })
    })

    it('should return error message when multiple selected options do not exist', () => {
        const selectedOptions = [
            {label: 'Option 1', value: 'option1'},
            {label: 'Option 5', value: 'option5'},
            {label: 'Option 6', value: 'option6'},
        ]

        const result = getFilterError({
            options: mockOptions,
            selectedOptions,
        })

        expect(result).toEqual({
            warningType: 'non-existent',
            warningMessage: NON_EXISTENT_VALUES_WARNING_MESSAGE,
        })
    })

    it('should return undefined if no selected options are provided', () => {
        const result = getFilterError({
            options: mockOptions,
            selectedOptions: undefined,
        })

        expect(result).toEqual({
            warningMessage: undefined,
            warningType: undefined,
        })
    })

    it('should return undefined if no options are provided', () => {
        const selectedOptions = [
            {label: 'Option 1', value: 'option1'},
            {label: 'Option 3', value: 'option3'},
        ]

        const result = getFilterError({
            options: [],
            selectedOptions,
        })

        expect(result).toEqual({
            warningMessage: undefined,
            warningType: undefined,
        })
    })

    it('should handle the case where selectedOptions is an empty array', () => {
        const selectedOptions: {label: string; value: string}[] = []

        const result = getFilterError({
            options: mockOptions,
            selectedOptions,
        })

        expect(result).toEqual({
            warningMessage: undefined,
            warningType: undefined,
        })
    })

    it('should handle empty options group', () => {
        const emptyOptions = [{options: []}]
        const selectedOptions = [{label: 'Option 1', value: 'option1'}]

        const result = getFilterError({
            options: emptyOptions,
            selectedOptions,
        })

        expect(result).toEqual({
            warningMessage: undefined,
            warningType: undefined,
        })
    })
})

describe('isFilterApplicable', () => {
    it('should return undefined if the filterKey exists in applicableFilters', () => {
        const result = isFilterApplicable({
            filterKey: FilterKey.Agents,
            applicableFilters: [
                FilterKey.Agents,
                FilterKey.Channels,
                FilterKey.CustomFields,
            ],
        })

        expect(result).toBeUndefined()
    })

    it('should return "not-applicable" if the filterKey does not exist in applicableFilters', () => {
        const result = isFilterApplicable({
            filterKey: 'filter4',
            applicableFilters: [
                FilterKey.Agents,
                FilterKey.Channels,
                FilterKey.CustomFields,
            ],
        })

        expect(result).toBe('not-applicable')
    })

    it('should correctly use the getValidMemberName function to validate the filterKey', () => {
        const result = isFilterApplicable({
            filterKey: 'tags',
            applicableFilters: [
                FilterKey.Tags,
                FilterKey.Channels,
                FilterKey.CustomFields,
            ],
        })

        expect(result).toBeUndefined()
    })

    it('should return "not-applicable" if getValidMemberName returns a filterKey that is not in applicableFilters', () => {
        const result = isFilterApplicable({
            filterKey: 'filter1',
            applicableFilters: [
                FilterKey.Tags,
                FilterKey.Channels,
                FilterKey.CustomFields,
            ],
        })

        expect(result).toBe('not-applicable')
    })

    it('should return "not-applicable" if applicableFilters is an empty array', () => {
        const result = isFilterApplicable({
            filterKey: 'filter1',
            applicableFilters: [],
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined if applicableFilters contains only the valid filterKey', () => {
        const result = isFilterApplicable({
            filterKey: FilterKey.Channels,
            applicableFilters: [
                FilterKey.Tags,
                FilterKey.Channels,
                FilterKey.CustomFields,
            ],
        })

        expect(result).toBeUndefined()
    })

    it('should return "not-applicable" if applicableFilters contains invalid filters that do not match the filterKey', () => {
        const result = isFilterApplicable({
            filterKey: FilterKey.Channels,
            applicableFilters: [FilterKey.Tags, FilterKey.CustomFields],
        })

        expect(result).toBe('not-applicable')
    })

    it('should not return "not-applicable" for FilterComponentKey', () => {
        const result = isFilterApplicable({
            filterKey: FilterComponentKey.PhoneIntegrations,
            applicableFilters: [
                FilterKey.Tags,
                FilterKey.CustomFields,
                FilterComponentKey.PhoneIntegrations,
            ],
        })

        expect(result).toBeUndefined()
    })
})

describe('getValidMemberName', () => {
    it('should return integrations for Store key', () => {
        expect(getValidMemberName(FilterComponentKey.Store)).toEqual(
            FilterKey.Integrations
        )
    })

    it('should return integrations for PhoneIntegration key', () => {
        expect(
            getValidMemberName(FilterComponentKey.PhoneIntegrations)
        ).toEqual(FilterKey.Integrations)
    })

    it('should return FilterKey for any other key', () => {
        expect(getValidMemberName(FilterKey.Tags)).toEqual('tags')
    })

    it('should return CustomFields for CustomField key', () => {
        expect(getValidMemberName(FilterComponentKey.CustomField)).toEqual(
            FilterKey.CustomFields
        )
    })
})

describe('areFiltersApplicable function', () => {
    const savedFilterDraft: SavedFilterDraft | SavedFilter | null = {
        id: 1,
        name: 'draft',
        filter_group: [
            {
                member: FilterKey.Channels,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            },
            {
                member: FilterKey.Agents,
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        ],
    }

    it('should return undefined if all filters in savedFilterDraft are applicable', () => {
        const result = areFiltersApplicable({
            savedFilterDraft,
            applicableFilters: [
                FilterKey.Channels,
                FilterKey.Agents,
                FilterKey.Integrations,
            ],
        })

        expect(result).toBeUndefined()
    })

    it('should return "not-applicable" if any filter in savedFilterDraft is not applicable', () => {
        const result = areFiltersApplicable({
            savedFilterDraft,
            applicableFilters: [FilterKey.Integrations],
        })

        expect(result).toBe('not-applicable')
    })

    it('should return undefined if savedFilterDraft has no filter_group', () => {
        const result = areFiltersApplicable({
            savedFilterDraft: {
                id: 1,
                name: 'draft',
                filter_group: [],
            },
            applicableFilters: [FilterKey.Channels, FilterKey.Agents],
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined if applicableFilters is empty', () => {
        const result = areFiltersApplicable({
            savedFilterDraft,
            applicableFilters: [],
        })

        expect(result).toBeUndefined()
    })

    it('should return "not-applicable" if savedFilterDraft filter_group contains a filter that is not valid', () => {
        const result = areFiltersApplicable({
            savedFilterDraft,
            applicableFilters: [FilterKey.Channels, FilterKey.Integrations],
        })

        expect(result).toBe('not-applicable')
    })

    it('should return undefined if savedFilterDraft filter_group is empty', () => {
        const result = areFiltersApplicable({
            savedFilterDraft: {
                filter_group: [],
            } as unknown as SavedFilterDraft,
            applicableFilters: [FilterKey.Channels, FilterKey.Integrations],
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined because getValidMemberName corrects the member name', () => {
        const result = areFiltersApplicable({
            savedFilterDraft: {
                id: 1,
                name: 'draft',
                filter_group: [
                    {
                        member: 'tags',
                        values: [],
                        operator: LogicalOperatorEnum.ONE_OF,
                    },
                    {
                        member: FilterKey.Agents,
                        values: [],
                        operator: LogicalOperatorEnum.ONE_OF,
                    },
                ],
            } as unknown as SavedFilterDraft,
            applicableFilters: [FilterKey.Agents, FilterKey.Tags],
        })

        expect(result).toBeUndefined()
    })
})

describe('createFilterOptions', () => {
    const tagsMapping = {
        '1': {name: 'tag1'},
        '2': {name: 'tag2'},
    }

    const existingTagIds = Object.keys(tagsMapping).map(Number)

    it('should return an array of tag options', () => {
        const actual = createFilterOptions(existingTagIds, tagsMapping)

        const expected = [
            {value: '1', label: tagsMapping[1].name},
            {value: '2', label: tagsMapping[2].name},
        ]

        expect(actual).toEqual(expected)
    })

    it('should return an array of tag options with undefined labels for missing tag ids', () => {
        const lastTagId = existingTagIds[existingTagIds.length - 1]
        const missingTagId = lastTagId + 1
        const missingTagIds = [missingTagId]

        const actual = createFilterOptions(missingTagIds, tagsMapping)

        const expected = [{value: String(missingTagId), label: undefined}]

        expect(actual).toEqual(expected)
    })
})

describe('filterValidOptions', () => {
    it('should return only options with a label', () => {
        const validOptions = [
            {value: '1', label: 'tag1'},
            {value: '2', label: 'tag2'},
        ]

        const invalidOption = {value: '3', label: undefined}

        const options = [...validOptions, invalidOption]

        const actual = filterValidOptions(options)

        expect(actual).toEqual(validOptions)
    })
})
