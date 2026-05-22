import type { TemplateValidationInputs } from './validateTemplateInputs'
import { validateTemplateInputs } from './validateTemplateInputs'

const inputs = (
    overrides: Partial<TemplateValidationInputs> = {},
): TemplateValidationInputs => ({
    productCount: 0,
    urlButtonCount: 0,
    qrButtonCount: 0,
    hasImage: false,
    ...overrides,
})

describe('validateTemplateInputs', () => {
    describe('text-only and image-only baselines', () => {
        it('allows plain text (no products, no buttons, no image)', () => {
            expect(validateTemplateInputs(inputs())).toEqual({ isValid: true })
        })

        it('allows text with image (no products, no buttons)', () => {
            expect(validateTemplateInputs(inputs({ hasImage: true }))).toEqual({
                isValid: true,
            })
        })
    })

    describe('products require a button', () => {
        it.each([1, 2, 3])(
            'blocks %i product(s) with no buttons',
            (productCount) => {
                const result = validateTemplateInputs(inputs({ productCount }))
                expect(result.isValid).toBe(false)
                if (!result.isValid) {
                    expect(result.reason).toMatch(/require at least one button/)
                }
            },
        )

        it('allows 1 product + 1 URL button', () => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount: 1, urlButtonCount: 1 }),
                ),
            ).toEqual({ isValid: true })
        })

        it('allows 1 product + 1 QR button', () => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount: 1, qrButtonCount: 1 }),
                ),
            ).toEqual({ isValid: true })
        })

        it('allows 1 product + 2 QR buttons', () => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount: 1, qrButtonCount: 2 }),
                ),
            ).toEqual({ isValid: true })
        })
    })

    describe('carousel rules (2-3 products)', () => {
        it.each([2, 3])('allows %i products + 1 URL button', (productCount) => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount, urlButtonCount: 1 }),
                ),
            ).toEqual({ isValid: true })
        })

        it.each([2, 3])('allows %i products + 2 QR buttons', (productCount) => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount, qrButtonCount: 2 }),
                ),
            ).toEqual({ isValid: true })
        })

        it.each([2, 3])(
            'blocks %i products + 1 QR button only',
            (productCount) => {
                const result = validateTemplateInputs(
                    inputs({ productCount, qrButtonCount: 1 }),
                )
                expect(result.isValid).toBe(false)
                if (!result.isValid) {
                    expect(result.reason).toMatch(/Quick Reply carousels/)
                }
            },
        )

        it.each([2, 3])('blocks %i products + 3 QR buttons', (productCount) => {
            const result = validateTemplateInputs(
                inputs({ productCount, qrButtonCount: 3 }),
            )
            expect(result.isValid).toBe(false)
        })

        it('allows products + 2 URL buttons (truncation, not degradation)', () => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount: 2, urlButtonCount: 2 }),
                ),
            ).toEqual({ isValid: true })
        })
    })

    describe('mixed button types', () => {
        it('blocks 1 product + 1 URL + 1 QR', () => {
            const result = validateTemplateInputs(
                inputs({
                    productCount: 1,
                    urlButtonCount: 1,
                    qrButtonCount: 1,
                }),
            )
            expect(result.isValid).toBe(false)
            if (!result.isValid) {
                expect(result.reason).toMatch(/all be the same type/)
            }
        })

        it('blocks 2 products + 1 URL + 1 QR', () => {
            expect(
                validateTemplateInputs(
                    inputs({
                        productCount: 2,
                        urlButtonCount: 1,
                        qrButtonCount: 1,
                    }),
                ).isValid,
            ).toBe(false)
        })
    })

    describe('max products', () => {
        it('blocks 4 products', () => {
            const result = validateTemplateInputs(
                inputs({ productCount: 4, urlButtonCount: 1 }),
            )
            expect(result.isValid).toBe(false)
            if (!result.isValid) {
                expect(result.reason).toMatch(/at most 3 products/)
            }
        })

        it('blocks 4 products even when buttons are otherwise valid', () => {
            expect(
                validateTemplateInputs(
                    inputs({ productCount: 4, qrButtonCount: 2 }),
                ).isValid,
            ).toBe(false)
        })
    })

    describe('buttons-only edge cases (no products)', () => {
        it('blocks 1 QR + no image (no matching template)', () => {
            const result = validateTemplateInputs(inputs({ qrButtonCount: 1 }))
            expect(result.isValid).toBe(false)
            if (!result.isValid) {
                expect(result.reason).toMatch(
                    /single Quick Reply with no image/,
                )
            }
        })

        it('allows 1 QR + image', () => {
            expect(
                validateTemplateInputs(
                    inputs({ qrButtonCount: 1, hasImage: true }),
                ),
            ).toEqual({ isValid: true })
        })

        it('allows 1 URL + no image', () => {
            expect(
                validateTemplateInputs(inputs({ urlButtonCount: 1 })),
            ).toEqual({ isValid: true })
        })

        it('allows 2 QR + no image', () => {
            expect(
                validateTemplateInputs(inputs({ qrButtonCount: 2 })),
            ).toEqual({ isValid: true })
        })

        it('allows 4 QR + no image', () => {
            expect(
                validateTemplateInputs(inputs({ qrButtonCount: 4 })),
            ).toEqual({ isValid: true })
        })
    })
})
