import { BPOPartner, Partner } from '@gorgias/helpdesk-types'

import { convertPartnerEnumToOptions } from '../utils'

describe('convertPartnerEnumToOptions', () => {
    it('should convert Partner enum to options array', () => {
        const result = convertPartnerEnumToOptions(Partner)

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('value')
        expect(result[0]).toHaveProperty('label')
    })

    it('should convert BPOPartner enum to options array', () => {
        const result = convertPartnerEnumToOptions(BPOPartner)

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('value')
        expect(result[0]).toHaveProperty('label')
    })

    it('should keep label same as value', () => {
        const mockEnum = {
            TEST1: 'example.com',
            TEST2: 'test.io',
            TEST3: 'my-company.com',
        }

        const result = convertPartnerEnumToOptions(mockEnum)

        expect(result[0].label).toBe('example.com')
        expect(result[1].label).toBe('test.io')
        expect(result[2].label).toBe('my-company.com')
    })
})
