import { INITIAL_BODY } from '../customActionConstants'
import type { ButtonConfig, Parameter } from '../customActionTypes'
import {
    removeDuplicates,
    trimLeftoverData,
    validateDropdownValues,
} from '../customActionUtils'

describe('removeDuplicates', () => {
    it('returns empty array for empty input', () => {
        expect(removeDuplicates([])).toEqual([])
    })

    it('keeps unique parameters', () => {
        const params: Parameter[] = [
            { key: 'a', value: '1' },
            { key: 'b', value: '2' },
        ]
        expect(removeDuplicates(params)).toEqual(params)
    })

    it('removes duplicate keys keeping first occurrence', () => {
        const params: Parameter[] = [
            { key: 'a', value: '1' },
            { key: 'a', value: '2' },
        ]
        expect(removeDuplicates(params)).toEqual([{ key: 'a', value: '1' }])
    })
})

describe('trimLeftoverData', () => {
    it('clears body for GET method', () => {
        const button: ButtonConfig = {
            label: 'Test',
            action: {
                method: 'GET',
                url: 'https://example.com',
                headers: [],
                params: [],
                body: {
                    contentType: 'application/json',
                    'application/json': { key: 'val' },
                    'application/x-www-form-urlencoded': [],
                },
            },
        }
        const result = trimLeftoverData(button)
        expect(result.action.body).toEqual(INITIAL_BODY)
    })

    it('clears form data when content type is json', () => {
        const button: ButtonConfig = {
            label: 'Test',
            action: {
                method: 'POST',
                url: 'https://example.com',
                headers: [],
                params: [],
                body: {
                    contentType: 'application/json',
                    'application/json': { key: 'val' },
                    'application/x-www-form-urlencoded': [
                        { key: 'stale', value: 'data' },
                    ],
                },
            },
        }
        const result = trimLeftoverData(button)
        expect(result.action.body['application/x-www-form-urlencoded']).toEqual(
            [],
        )
        expect(result.action.body['application/json']).toEqual({ key: 'val' })
    })

    it('clears json data when content type is form', () => {
        const button: ButtonConfig = {
            label: 'Test',
            action: {
                method: 'POST',
                url: 'https://example.com',
                headers: [],
                params: [],
                body: {
                    contentType: 'application/x-www-form-urlencoded',
                    'application/json': { stale: 'data' },
                    'application/x-www-form-urlencoded': [
                        { key: 'field', value: 'val' },
                    ],
                },
            },
        }
        const result = trimLeftoverData(button)
        expect(result.action.body['application/json']).toEqual({})
        expect(result.action.body['application/x-www-form-urlencoded']).toEqual(
            [{ key: 'field', value: 'val' }],
        )
    })

    it('deduplicates headers and params', () => {
        const button: ButtonConfig = {
            label: 'Test',
            action: {
                method: 'GET',
                url: 'https://example.com',
                headers: [
                    { key: 'Auth', value: '1' },
                    { key: 'Auth', value: '2' },
                ],
                params: [
                    { key: 'q', value: 'a' },
                    { key: 'q', value: 'b' },
                ],
                body: { ...INITIAL_BODY },
            },
        }
        const result = trimLeftoverData(button)
        expect(result.action.headers).toHaveLength(1)
        expect(result.action.params).toHaveLength(1)
    })
})

describe('validateDropdownValues', () => {
    it('returns undefined for empty value', () => {
        expect(validateDropdownValues('')).toBeUndefined()
        expect(validateDropdownValues(undefined)).toBeUndefined()
    })

    it('returns undefined when within limit', () => {
        expect(validateDropdownValues('a;b;c')).toBeUndefined()
    })

    it('returns error when exceeding limit', () => {
        const values = Array.from({ length: 11 }, (_, i) => `v${i}`).join(';')
        expect(validateDropdownValues(values)).toContain('Limit reached')
    })
})
