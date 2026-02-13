import { describe, expect, it } from 'vitest'

import { mergeTicketFieldsValues } from '../utils/mergeTicketFieldsValues'

describe('mergeTicketFieldsValues', () => {
    it('should return fields unchanged when no macro values are provided', () => {
        const fields = {
            1: { id: 1, value: 'existing' },
            2: { id: 2, value: 42 },
        }

        expect(mergeTicketFieldsValues(fields)).toEqual(fields)
        expect(mergeTicketFieldsValues(fields, {})).toEqual(fields)
    })

    it('should override existing field values preserving other properties and add new entries', () => {
        const fields = {
            1: { id: 1, value: '', hasError: true },
            2: { id: 2, value: 'keep me' },
        }

        const result = mergeTicketFieldsValues(fields, {
            1: 'macro value',
            99: 'new value',
        })

        expect(result[1]).toEqual({
            id: 1,
            value: 'macro value',
            hasError: true,
        })
        expect(result[2]).toEqual({ id: 2, value: 'keep me' })
        expect(result[99]).toEqual({ value: 'new value' })
    })
})
