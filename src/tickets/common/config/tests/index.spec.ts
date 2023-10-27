import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'

import {
    CHANNELS,
    DEFAULT_CHANNEL,
    DEFAULT_SOURCE_TYPE,
    PREVIOUS_VARIABLES,
    STATUSES,
    SYSTEM_SOURCE_TYPES,
    USABLE_SOURCE_TYPES,
    VARIABLES,
} from '..'

describe('DEFAULT_CHANNEL', () => {
    it('is string', () => {
        expect(_isString(DEFAULT_CHANNEL)).toBe(true)
    })
})

describe('DEFAULT_SOURCE_TYPE', () => {
    it('is string', () => {
        expect(_isString(DEFAULT_SOURCE_TYPE)).toBe(true)
    })
})

describe('STATUSES', () => {
    it('is array', () => {
        expect(_isArray(STATUSES)).toBe(true)
    })
})

describe('CHANNELS', () => {
    it('is array', () => {
        expect(_isArray(CHANNELS)).toBe(true)
    })
})

describe('SYSTEM_SOURCE_TYPES', () => {
    it('is array', () => {
        expect(_isArray(SYSTEM_SOURCE_TYPES)).toBe(true)
    })
})

describe('USABLE_SOURCE_TYPES', () => {
    it('is array', () => {
        expect(_isArray(USABLE_SOURCE_TYPES)).toBe(true)
    })
})

describe.each([
    ['VARIABLES', VARIABLES],
    ['PREVIOUS_VARIABLES', PREVIOUS_VARIABLES],
])('%s', (_name, value) => {
    it('is array', () => {
        expect(_isArray(value)).toBe(true)
    })

    it('is array of objects', () => {
        expect(_isObject(value[0])).toBe(true)
    })

    it('structure of objects', () => {
        const object = value[0]
        expect(object).toHaveProperty('name')
        expect(object).toHaveProperty('children')
    })

    it("structure of object's children", () => {
        const child = value[0].children ? value[0].children[0] : {}
        expect(child).toHaveProperty('name')
        expect(child).toHaveProperty('value')
    })
})
