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

    it('should remove common TLDs from domain', () => {
        const mockEnum = {
            TEST1: 'example.com',
            TEST2: 'test.io',
            TEST3: 'site.co',
        }

        const result = convertPartnerEnumToOptions(mockEnum)

        expect(result[0].label).toBe('Example')
        expect(result[1].label).toBe('Test')
        expect(result[2].label).toBe('Site')
    })

    it('should convert hyphens and underscores to spaces', () => {
        const mockEnum = {
            TEST1: 'my-company.com',
            TEST2: 'test_agency.com',
            TEST3: 'multi-word-name.io',
        }

        const result = convertPartnerEnumToOptions(mockEnum)

        expect(result[0].label).toBe('My Company')
        expect(result[1].label).toBe('Test Agency')
        expect(result[2].label).toBe('Multi Word Name')
    })

    it('should capitalize each word', () => {
        const mockEnum = {
            TEST1: 'lowercase.com',
            TEST2: 'multiple-words.com',
        }

        const result = convertPartnerEnumToOptions(mockEnum)

        expect(result[0].label).toBe('Lowercase')
        expect(result[1].label).toBe('Multiple Words')
    })

    it('should keep domain as value', () => {
        const mockEnum = {
            TEST: 'example.com',
        }

        const result = convertPartnerEnumToOptions(mockEnum)

        expect(result[0].value).toBe('example.com')
    })
})
