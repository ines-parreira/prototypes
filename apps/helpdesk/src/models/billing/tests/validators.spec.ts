import { billingContact } from 'fixtures/resources'
import { getBillingContactSchema } from 'models/billing/validators'
import type { BillingContactDetailResponse } from 'state/billing/types'
import { TaxIdType, TaxIdVerificationStatus } from 'state/billing/types'

const generateInvalidJSONTypes = (validValues: any[]) => {
    const jsonValues = [null, undefined, 'string', 123, true, [], {}]
    return jsonValues.filter(
        (jsonValue) =>
            !validValues
                .map((validValue) =>
                    validValue === null || validValue === undefined
                        ? jsonValue === validValue
                        : typeof jsonValue === typeof validValue,
                )
                .reduce(
                    (previousValue: boolean, currentValue: boolean) =>
                        previousValue || currentValue,
                    false,
                ),
    )
}

const generateZodErrorPath = (path: string[]): RegExp => {
    return new RegExp(
        '"path": \\[\\s*' +
            path
                .map((segment) => `"${segment.replace(/"/g, '\\"')}"`)
                .join(',\\s*'),
    )
}

describe('getBillingContactSchema', () => {
    it('should return an object of the correct type', () => {
        const result = getBillingContactSchema.safeParse(billingContact)

        if (result.success === false) {
            return
        }

        // @ts-expect-no-error
        const __correctType: BillingContactDetailResponse = result.data

        // @ts-expect-error
        const __incorrectType: { other: boolean } = result.data
    })

    it.each([...generateInvalidJSONTypes(['string']), 'notanemail'])(
        'should fail validation if email is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    email: value,
                }),
            ).toThrow(generateZodErrorPath(['email']))
        },
    )

    it.each(generateInvalidJSONTypes(['string']))(
        'should fail validation if shipping.address.city is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            ...billingContact.shipping.address,
                            city: value,
                        },
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'address', 'city']))
        },
    )

    it.each(generateInvalidJSONTypes(['string']))(
        'should fail validation if shipping.address.country is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            ...billingContact.shipping.address,
                            country: value,
                        },
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'address', 'country']))
        },
    )

    it.each(generateInvalidJSONTypes(['string']))(
        'should fail validation if shipping.address.line1 is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            ...billingContact.shipping.address,
                            line1: value,
                        },
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'address', 'line1']))
        },
    )

    it.each(generateInvalidJSONTypes(['string', null]))(
        'should fail validation if shipping.address.line2 is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            ...billingContact.shipping.address,
                            line2: value,
                        },
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'address', 'line2']))
        },
    )

    it.each(generateInvalidJSONTypes(['string']))(
        'should fail validation if shipping.address.postal_code is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            ...billingContact.shipping.address,
                            postal_code: value,
                        },
                    },
                }),
            ).toThrow(
                generateZodErrorPath(['shipping', 'address', 'postal_code']),
            )
        },
    )

    it.each(generateInvalidJSONTypes(['string', undefined]))(
        'should fail validation if shipping.address.state is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            ...billingContact.shipping.address,
                            state: value,
                        },
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'address', 'state']))
        },
    )

    it.each(generateInvalidJSONTypes(['string']))(
        'should fail validation if shipping.name is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        name: value,
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'name']))
        },
    )

    it.each(generateInvalidJSONTypes(['string', null, undefined]))(
        'should fail validation if shipping.phone is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        phone: value,
                    },
                }),
            ).toThrow(generateZodErrorPath(['shipping', 'phone']))
        },
    )

    it.each(generateInvalidJSONTypes([{}, undefined]))(
        'should fail validation if tax_ids is invalid [value: %s]',
        async (value: any) => {
            expect(() =>
                getBillingContactSchema.parse({
                    ...billingContact,
                    tax_ids: value,
                }),
            ).toThrow(generateZodErrorPath(['tax_ids']))
        },
    )

    describe.each(Object.values(TaxIdType))(
        'tax_id types [type: %s]',
        (taxIdType: TaxIdType) => {
            it.each(generateInvalidJSONTypes([{}, undefined]))(
                `should fail validation if tax_ids.${taxIdType} is invalid [value: %s]`,
                async (value: any) => {
                    expect(() =>
                        getBillingContactSchema.parse({
                            ...billingContact,
                            tax_ids: {
                                [taxIdType]: value,
                            },
                        }),
                    ).toThrow(generateZodErrorPath(['tax_ids', taxIdType]))
                },
            )

            it.each(generateInvalidJSONTypes(['string']))(
                `should fail validation if tax_ids.${taxIdType}.type is invalid [value: %s]`,
                async (value: any) => {
                    expect(() =>
                        getBillingContactSchema.parse({
                            ...billingContact,
                            tax_ids: {
                                [taxIdType]: {
                                    type: value,
                                    value: 'valid value',
                                    verification:
                                        TaxIdVerificationStatus.Verified,
                                },
                            },
                        }),
                    ).toThrow(
                        generateZodErrorPath(['tax_ids', taxIdType, 'type']),
                    )
                },
            )

            it.each(generateInvalidJSONTypes(['string']))(
                `should fail validation if tax_ids.${taxIdType}.value is invalid [value: %s]`,
                async (value: any) => {
                    expect(() =>
                        getBillingContactSchema.parse({
                            ...billingContact,
                            tax_ids: {
                                [taxIdType]: {
                                    type: taxIdType,
                                    value: value,
                                    verification:
                                        TaxIdVerificationStatus.Verified,
                                },
                            },
                        }),
                    ).toThrow(
                        generateZodErrorPath(['tax_ids', taxIdType, 'value']),
                    )
                },
            )

            it.each(generateInvalidJSONTypes(['string']))(
                `should fail validation if tax_ids.${taxIdType}.verification is invalid [value: %s]`,
                async (value: any) => {
                    expect(() =>
                        getBillingContactSchema.parse({
                            ...billingContact,
                            tax_ids: {
                                [taxIdType]: {
                                    type: taxIdType,
                                    value: 'valid value',
                                    verification: value,
                                },
                            },
                        }),
                    ).toThrow(
                        generateZodErrorPath([
                            'tax_ids',
                            taxIdType,
                            'verification',
                        ]),
                    )
                },
            )
        },
    )
})
