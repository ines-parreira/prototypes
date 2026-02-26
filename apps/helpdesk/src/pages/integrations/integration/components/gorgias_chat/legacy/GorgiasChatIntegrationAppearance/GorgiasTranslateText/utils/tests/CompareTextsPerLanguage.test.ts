import type { TextsPerLanguage } from 'rest_api/gorgias_chat_protected_api/types'

import isEqualTextsPerLanguage from '../CompareTextsPerLanguage'

describe('isEqualTextsPerLanguage', () => {
    it('should treat objects as equal', () => {
        const draft: TextsPerLanguage = {
            //@ts-ignore ts(2322)
            texts: { privacyPolicyDisclaimer: 'some' },
            sspTexts: {},
            meta: {},
        }

        const reference: TextsPerLanguage = {
            texts: { privacyPolicyDisclaimer: 'some' },
            sspTexts: {},
            meta: {},
        }

        expect(isEqualTextsPerLanguage(draft, reference)).toBe(true)
    })

    it('should treat objects as equal if the only difference is undefined properties and should not mutate the input objects', () => {
        const draft: TextsPerLanguage = {
            //@ts-ignore ts(2322)
            meta: { privacyPolicyDisclaimer: undefined },
            texts: {},
            sspTexts: {},
        }

        const reference: TextsPerLanguage = {
            meta: {},
            texts: {},
            sspTexts: {},
        }

        expect(isEqualTextsPerLanguage(draft, reference)).toBe(true)
        // Confirm that the original objects are not mutated.
        expect(draft).toMatchInlineSnapshot(`
            {
              "meta": {
                "privacyPolicyDisclaimer": undefined,
              },
              "sspTexts": {},
              "texts": {},
            }
        `)
    })

    it('should treat objects as unequal if there are differences other than undefined properties', () => {
        const draft: TextsPerLanguage = {
            texts: { privacyPolicyDisclaimer: 'Some Text' },
            sspTexts: {},
            meta: {},
        }

        const reference: TextsPerLanguage = {
            texts: {},
            sspTexts: {},
            meta: {},
        }

        expect(isEqualTextsPerLanguage(draft, reference)).toBe(false)
    })

    it('should treat objects as unequal if there are differences other than undefined properties (extended dataset)', () => {
        const draft: TextsPerLanguage = {
            texts: {
                A: 'Some Text',
                B: 'Some Text',
                C: 'Some Text',
                D: 'Some Text',
            },
            sspTexts: {},
            meta: {},
        }

        const reference: TextsPerLanguage = {
            texts: {
                A: 'Some Text',
                B: 'Some Text',
                C: 'Some Text',
                D: 'Some NEW text',
            },
            sspTexts: {},
            meta: {},
        }

        expect(isEqualTextsPerLanguage(draft, reference)).toBe(false)
    })

    // NOTE. While this would have been better, this is not needed at the moment.
    it.skip('should treat objects as equal (robust to the order of keys)', () => {
        const draft: TextsPerLanguage = {
            texts: {
                A: 'Some Text',
                B: 'Some Text',
                C: 'Some Text',
                D: 'Some Text',
            },
            sspTexts: {},
            meta: {},
        }

        const reference: TextsPerLanguage = {
            sspTexts: {}, // Reversed order.
            texts: {
                A: 'Some Text',
                B: 'Some Text',
                D: 'Some text', // Reversed order.
                C: 'Some Text',
            },
            meta: {},
        }

        expect(isEqualTextsPerLanguage(draft, reference)).toBe(true)
    })
})
