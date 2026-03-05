import { INITIAL_BODY } from '../customActionConstants'
import type { ButtonConfig, Parameter } from '../customActionTypes'
import {
    applyParameterConstraints,
    isValidActionUrl,
    isValidLinkUrl,
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
            { id: '1', key: 'a', value: '1' },
            { id: '2', key: 'b', value: '2' },
        ]
        expect(removeDuplicates(params)).toEqual(params)
    })

    it('removes duplicate keys keeping first occurrence', () => {
        const params: Parameter[] = [
            { id: '1', key: 'a', value: '1' },
            { id: '2', key: 'a', value: '2' },
        ]
        expect(removeDuplicates(params)).toEqual([
            { id: '1', key: 'a', value: '1' },
        ])
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
                        { id: '1', key: 'stale', value: 'data' },
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
                        { id: '1', key: 'field', value: 'val' },
                    ],
                },
            },
        }
        const result = trimLeftoverData(button)
        expect(result.action.body['application/json']).toEqual({})
        expect(result.action.body['application/x-www-form-urlencoded']).toEqual(
            [{ id: '1', key: 'field', value: 'val' }],
        )
    })

    it('deduplicates headers and params', () => {
        const button: ButtonConfig = {
            label: 'Test',
            action: {
                method: 'GET',
                url: 'https://example.com',
                headers: [
                    { id: '1', key: 'Auth', value: '1' },
                    { id: '2', key: 'Auth', value: '2' },
                ],
                params: [
                    { id: '3', key: 'q', value: 'a' },
                    { id: '4', key: 'q', value: 'b' },
                ],
                body: { ...INITIAL_BODY },
            },
        }
        const result = trimLeftoverData(button)
        expect(result.action.headers).toHaveLength(1)
        expect(result.action.params).toHaveLength(1)
    })
})

describe('isValidActionUrl', () => {
    it('returns false for empty string', () => {
        expect(isValidActionUrl('')).toBe(false)
        expect(isValidActionUrl('   ')).toBe(false)
    })

    it('returns true for valid URLs', () => {
        expect(isValidActionUrl('https://example.com')).toBe(true)
        expect(isValidActionUrl('https://api.example.com/endpoint')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
        expect(isValidActionUrl('not-a-url')).toBe(false)
        expect(isValidActionUrl('://missing-scheme')).toBe(false)
    })

    it('returns true for URLs with template variables', () => {
        expect(isValidActionUrl('{{shopify_domain}}/orders')).toBe(true)
        expect(isValidActionUrl('https://{{domain}}/api')).toBe(true)
    })
})

describe('isValidLinkUrl', () => {
    it('returns false for empty string', () => {
        expect(isValidLinkUrl('')).toBe(false)
        expect(isValidLinkUrl('   ')).toBe(false)
    })

    it('returns true for valid URLs', () => {
        expect(isValidLinkUrl('https://example.com')).toBe(true)
        expect(isValidLinkUrl('example.com')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
        expect(isValidLinkUrl('not a url at all')).toBe(false)
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

describe('applyParameterConstraints', () => {
    it('sets editable to true when type is dropdown', () => {
        const param: Parameter = {
            id: '1',
            key: 'field',
            value: '',
            type: 'dropdown',
            editable: false,
            mandatory: false,
        }
        expect(applyParameterConstraints(param)).toEqual(
            expect.objectContaining({ editable: true }),
        )
    })

    it('sets mandatory to false when editable is false', () => {
        const param: Parameter = {
            id: '1',
            key: 'field',
            value: '',
            type: 'text',
            editable: false,
            mandatory: true,
        }
        expect(applyParameterConstraints(param)).toEqual(
            expect.objectContaining({ mandatory: false }),
        )
    })

    it('preserves mandatory when editable is true', () => {
        const param: Parameter = {
            id: '1',
            key: 'field',
            value: '',
            type: 'text',
            editable: true,
            mandatory: true,
        }
        expect(applyParameterConstraints(param)).toEqual(
            expect.objectContaining({ editable: true, mandatory: true }),
        )
    })
})
