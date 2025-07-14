import {
    transformCategoriesSeparator,
    transformCategorySeparator,
} from 'domains/reporting/hooks/helpers'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { TICKET_CUSTOM_FIELDS_NEW_SEPARATOR } from 'domains/reporting/pages/utils'

describe('transformCategorySeparator', () => {
    it('should transform a category with API separator to new separator', () => {
        const input = `category1${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category2${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category3`
        const expected = `category1${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category2${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category3`

        expect(transformCategorySeparator(input)).toBe(expected)
    })

    it('should return NOT_AVAILABLE_PLACEHOLDER for null input', () => {
        expect(transformCategorySeparator(null)).toBe(NOT_AVAILABLE_PLACEHOLDER)
    })

    it('should return NOT_AVAILABLE_PLACEHOLDER for undefined input', () => {
        expect(transformCategorySeparator(undefined)).toBe(
            NOT_AVAILABLE_PLACEHOLDER,
        )
    })

    it('should return NOT_AVAILABLE_PLACEHOLDER for empty string', () => {
        expect(transformCategorySeparator('')).toBe(NOT_AVAILABLE_PLACEHOLDER)
    })

    it('should handle category without separators', () => {
        const input = 'singleCategory'
        expect(transformCategorySeparator(input)).toBe(input)
    })
})

describe('transformCategoriesSeparator', () => {
    it('should transform multiple categories with API separator to new separator', () => {
        const input = [
            `category1${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category2`,
            `category3${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category4`,
        ]
        const expected = [
            `category1${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category2`,
            `category3${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category4`,
        ]

        expect(transformCategoriesSeparator(input)).toEqual(expected)
    })

    it('should handle empty array', () => {
        expect(transformCategoriesSeparator([])).toEqual([])
    })

    it('should handle array with null values', () => {
        const input = [
            `category1${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category2`,
            null,
            `category3${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category4`,
        ]
        const expected = [
            `category1${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category2`,
            NOT_AVAILABLE_PLACEHOLDER,
            `category3${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category4`,
        ]

        expect(transformCategoriesSeparator(input)).toEqual(expected)
    })

    it('should handle array with empty strings', () => {
        const input = [
            `category1${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category2`,
            '',
            `category3${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category4`,
        ]
        const expected = [
            `category1${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category2`,
            NOT_AVAILABLE_PLACEHOLDER,
            `category3${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category4`,
        ]

        expect(transformCategoriesSeparator(input)).toEqual(expected)
    })

    it('should handle array with categories without separators', () => {
        const input = [
            'singleCategory1',
            `category2${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category3`,
            'singleCategory4',
        ]
        const expected = [
            'singleCategory1',
            `category2${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category3`,
            'singleCategory4',
        ]

        expect(transformCategoriesSeparator(input)).toEqual(expected)
    })

    it('should handle undefined input', () => {
        expect(transformCategoriesSeparator(undefined)).toEqual([])
    })

    it('should handle array with multiple separators in a single category', () => {
        const input = [
            `category1${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category2${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category3`,
            `category4${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category5`,
        ]
        const expected = [
            `category1${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category2${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category3`,
            `category4${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category5`,
        ]

        expect(transformCategoriesSeparator(input)).toEqual(expected)
    })

    it('should handle array with mixed null, empty, and valid categories', () => {
        const input: (string | null)[] = [
            null,
            '',
            `category1${TICKET_CUSTOM_FIELDS_API_SEPARATOR}category2`,
            'singleCategory',
            null,
        ]
        const expected = [
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            `category1${TICKET_CUSTOM_FIELDS_NEW_SEPARATOR}category2`,
            'singleCategory',
            NOT_AVAILABLE_PLACEHOLDER,
        ]

        expect(transformCategoriesSeparator(input)).toEqual(expected)
    })
})
