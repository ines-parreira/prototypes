import {
    mockAutomateFeatures,
    mockBillingState,
    mockCouponSummary,
    mockCustomerSummary,
    mockHelpdeskFeatures,
    mockLegacyAutomatePlan,
    mockLegacyHelpdeskPlan,
    mockLegacySmsPlan,
    mockLegacyVoicePlan,
    mockMeteredConvertPlan,
    mockSubscriptionSummary,
    mockUpcomingInvoiceSummary,
} from '@gorgias/helpdesk-mocks'
import * as API from '@gorgias/helpdesk-types'

import { mapBillingState } from '../mappers'
import {
    BillingAddressValidationStatus,
    Cadence,
    HelpdeskPlanTier,
    ProductType,
    SubscriptionStatus,
} from '../types'

describe('mapBillingState', () => {
    describe('subscription.status', () => {
        const subscriptionStatusCases = [
            [API.SubscriptionStatus.Active, SubscriptionStatus.ACTIVE],
            [API.SubscriptionStatus.Canceled, SubscriptionStatus.CANCELED],
            [API.SubscriptionStatus.Incomplete, SubscriptionStatus.INCOMPLETE],
            [
                API.SubscriptionStatus.IncompleteExpired,
                SubscriptionStatus.INCOMPLETE_EXPIRED,
            ],
            [API.SubscriptionStatus.PastDue, SubscriptionStatus.PAST_DUE],
            [API.SubscriptionStatus.Trialing, SubscriptionStatus.TRIALING],
            [API.SubscriptionStatus.Unpaid, SubscriptionStatus.UNPAID],
        ] as const satisfies ReadonlyArray<
            readonly [API.SubscriptionStatus, SubscriptionStatus]
        >

        const __subscriptionStatusExhaustive: Exclude<
            API.SubscriptionStatus,
            (typeof subscriptionStatusCases)[number][0]
        > extends never
            ? true
            : never = true

        it.each(subscriptionStatusCases)(
            'maps %s to the internal equivalent',
            (apiStatus, expectedStatus) => {
                const state = mockBillingState({
                    subscription: mockSubscriptionSummary({
                        status: apiStatus,
                    }),
                })
                expect(mapBillingState(state).subscription.status).toBe(
                    expectedStatus,
                )
            },
        )

        it('throws on an unrecognised status value', () => {
            const state = mockBillingState({
                subscription: mockSubscriptionSummary({
                    status: 'unknown' as API.SubscriptionStatus,
                }),
            })
            expect(() => mapBillingState(state)).toThrow(
                'Unknown subscription status: unknown',
            )
        })
    })

    describe('subscription.cadence', () => {
        const cadenceCases = [
            [API.Interval.Month, Cadence.Month],
            [API.Interval.Year, Cadence.Year],
        ] as const satisfies ReadonlyArray<readonly [API.Interval, Cadence]>

        const __cadenceExhaustive: Exclude<
            API.Interval,
            (typeof cadenceCases)[number][0]
        > extends never
            ? true
            : never = true

        it.each(cadenceCases)(
            'maps %s to the internal equivalent',
            (apiCadence, expectedCadence) => {
                const state = mockBillingState({
                    subscription: mockSubscriptionSummary({
                        cadence: apiCadence,
                    }),
                })
                expect(mapBillingState(state).subscription.cadence).toBe(
                    expectedCadence,
                )
            },
        )

        it('throws on an unrecognised cadence value', () => {
            const state = mockBillingState({
                subscription: mockSubscriptionSummary({
                    cadence: 'unknown' as API.Interval,
                }),
            })
            expect(() => mapBillingState(state)).toThrow(
                'Unknown cadence: unknown',
            )
        })
    })

    describe('subscription.coupon', () => {
        it('maps coupon products when present', () => {
            const state = mockBillingState({
                subscription: mockSubscriptionSummary({
                    coupon: mockCouponSummary({
                        products: [
                            API.ProductType.Helpdesk,
                            API.ProductType.Automation,
                        ],
                    }),
                }),
            })
            expect(
                mapBillingState(state).subscription.coupon?.products,
            ).toEqual([ProductType.Helpdesk, ProductType.Automation])
        })

        it('passes null coupon through', () => {
            const state = mockBillingState({
                subscription: mockSubscriptionSummary({ coupon: null }),
            })
            expect(mapBillingState(state).subscription.coupon).toBeNull()
        })
    })

    describe('customer.billing_address_validation_status', () => {
        const billingAddressValidationStatusCases = [
            [
                API.BillingAddressValidationStatus.NotValidated,
                BillingAddressValidationStatus.NotValidated,
            ],
            [
                API.BillingAddressValidationStatus.Valid,
                BillingAddressValidationStatus.Valid,
            ],
            [
                API.BillingAddressValidationStatus.PartiallyValid,
                BillingAddressValidationStatus.PartiallyValid,
            ],
            [
                API.BillingAddressValidationStatus.Invalid,
                BillingAddressValidationStatus.Invalid,
            ],
        ] as const satisfies ReadonlyArray<
            readonly [
                API.BillingAddressValidationStatus,
                BillingAddressValidationStatus,
            ]
        >

        const __billingAddressValidationStatusExhaustive: Exclude<
            API.BillingAddressValidationStatus,
            (typeof billingAddressValidationStatusCases)[number][0]
        > extends never
            ? true
            : never = true

        it.each(billingAddressValidationStatusCases)(
            'maps %s to the internal equivalent',
            (apiStatus, expectedStatus) => {
                const state = mockBillingState({
                    customer: mockCustomerSummary({
                        billing_address_validation_status: apiStatus,
                    }),
                })
                expect(
                    mapBillingState(state).customer
                        .billing_address_validation_status,
                ).toBe(expectedStatus)
            },
        )

        it('passes null billing_address_validation_status through', () => {
            const state = mockBillingState({
                customer: mockCustomerSummary({
                    billing_address_validation_status: null,
                }),
            })
            expect(
                mapBillingState(state).customer
                    .billing_address_validation_status,
            ).toBeNull()
        })

        it('throws on an unrecognised billing address validation status', () => {
            const state = mockBillingState({
                customer: mockCustomerSummary({
                    billing_address_validation_status:
                        'unknown' as API.BillingAddressValidationStatus,
                }),
            })
            expect(() => mapBillingState(state)).toThrow(
                'Unknown billing address validation status: unknown',
            )
        })
    })

    describe('customer.coupon', () => {
        it('maps coupon products when present', () => {
            const state = mockBillingState({
                customer: mockCustomerSummary({
                    coupon: mockCouponSummary({
                        products: [API.ProductType.Helpdesk],
                    }),
                }),
            })
            expect(mapBillingState(state).customer.coupon?.products).toEqual([
                ProductType.Helpdesk,
            ])
        })

        it('passes null coupon through', () => {
            const state = mockBillingState({
                customer: mockCustomerSummary({ coupon: null }),
            })
            expect(mapBillingState(state).customer.coupon).toBeNull()
        })
    })

    describe('current_plans.helpdesk.tier', () => {
        const helpdeskPlanTierCases = [
            [API.HelpdeskPlanTier.Starter, HelpdeskPlanTier.STARTER],
            [API.HelpdeskPlanTier.Basic, HelpdeskPlanTier.BASIC],
            [API.HelpdeskPlanTier.Advanced, HelpdeskPlanTier.ADVANCED],
            [API.HelpdeskPlanTier.Pro, HelpdeskPlanTier.PRO],
            [API.HelpdeskPlanTier.Custom, HelpdeskPlanTier.CUSTOM],
            [API.HelpdeskPlanTier.Other, HelpdeskPlanTier.OTHER],
        ] as const satisfies ReadonlyArray<
            readonly [API.HelpdeskPlanTier, HelpdeskPlanTier]
        >

        const __helpdeskPlanTierExhaustive: Exclude<
            API.HelpdeskPlanTier,
            (typeof helpdeskPlanTierCases)[number][0]
        > extends never
            ? true
            : never = true

        it.each(helpdeskPlanTierCases)(
            'maps %s to the internal equivalent',
            (apiTier, expectedTier) => {
                const state = mockBillingState({
                    current_plans: {
                        helpdesk: mockLegacyHelpdeskPlan({ tier: apiTier }),
                        automate: null,
                        voice: null,
                        sms: null,
                        convert: null,
                    },
                })
                expect(mapBillingState(state).current_plans.helpdesk.tier).toBe(
                    expectedTier,
                )
            },
        )

        it('passes undefined tier through', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan({ tier: undefined }),
                    automate: null,
                    voice: null,
                    sms: null,
                    convert: null,
                },
            })
            expect(
                mapBillingState(state).current_plans.helpdesk.tier,
            ).toBeUndefined()
        })

        it('throws on an unrecognised tier value', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan({
                        tier: 'unknown' as API.HelpdeskPlanTier,
                    }),
                    automate: null,
                    voice: null,
                    sms: null,
                    convert: null,
                },
            })
            expect(() => mapBillingState(state)).toThrow(
                'Unknown helpdesk plan tier: unknown',
            )
        })
    })

    describe('current_plans.helpdesk.features', () => {
        it('merges automate_features and helpdesk_features into a flat object', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan({
                        features: {
                            automate_features: mockAutomateFeatures({
                                automation_managed_rules: { enabled: true },
                            }),
                            helpdesk_features: mockHelpdeskFeatures({
                                auto_assignment: { enabled: false },
                            }),
                        },
                    }),
                    automate: null,
                    voice: null,
                    sms: null,
                    convert: null,
                },
            })
            const { features } = mapBillingState(state).current_plans.helpdesk
            expect(features).toMatchObject({
                automation_managed_rules: { enabled: true },
                auto_assignment: { enabled: false },
            })
        })
    })

    describe('parseProductType (via current_plans.helpdesk.product)', () => {
        const productTypeCases = [
            [API.ProductType.Helpdesk, ProductType.Helpdesk],
            [API.ProductType.Automation, ProductType.Automation],
            [API.ProductType.Voice, ProductType.Voice],
            [API.ProductType.Sms, ProductType.SMS],
            [API.ProductType.Convert, ProductType.Convert],
        ] as const satisfies ReadonlyArray<
            readonly [API.ProductType, ProductType]
        >

        const __productTypeExhaustive: Exclude<
            API.ProductType,
            (typeof productTypeCases)[number][0]
        > extends never
            ? true
            : never = true

        it.each(productTypeCases)(
            'maps %s to the internal equivalent',
            (apiProduct, expectedProduct) => {
                const state = mockBillingState({
                    current_plans: {
                        helpdesk: mockLegacyHelpdeskPlan({
                            product: apiProduct,
                        }),
                        automate: null,
                        voice: null,
                        sms: null,
                        convert: null,
                    },
                })
                expect(
                    mapBillingState(state).current_plans.helpdesk.product,
                ).toBe(expectedProduct)
            },
        )

        it('throws on an unrecognised product type', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan({
                        product: 'unknown' as API.ProductType,
                    }),
                    automate: null,
                    voice: null,
                    sms: null,
                    convert: null,
                },
            })
            expect(() => mapBillingState(state)).toThrow(
                'Unknown product type: unknown',
            )
        })
    })

    describe('current_plans optional plans', () => {
        it('maps automate plan when present', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan(),
                    automate: mockLegacyAutomatePlan(),
                    voice: null,
                    sms: null,
                    convert: null,
                },
            })
            expect(mapBillingState(state).current_plans.automate?.product).toBe(
                ProductType.Automation,
            )
        })

        it('passes null for automate when absent', () => {
            expect(
                mapBillingState(
                    mockBillingState({
                        current_plans: {
                            helpdesk: mockLegacyHelpdeskPlan(),
                            automate: null,
                            voice: null,
                            sms: null,
                            convert: null,
                        },
                    }),
                ).current_plans.automate,
            ).toBeNull()
        })

        it('maps voice plan when present', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan(),
                    automate: null,
                    voice: mockLegacyVoicePlan(),
                    sms: null,
                    convert: null,
                },
            })
            expect(mapBillingState(state).current_plans.voice?.product).toBe(
                ProductType.Voice,
            )
        })

        it('passes null for voice when absent', () => {
            expect(
                mapBillingState(
                    mockBillingState({
                        current_plans: {
                            helpdesk: mockLegacyHelpdeskPlan(),
                            automate: null,
                            voice: null,
                            sms: null,
                            convert: null,
                        },
                    }),
                ).current_plans.voice,
            ).toBeNull()
        })

        it('maps sms plan when present', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan(),
                    automate: null,
                    voice: null,
                    sms: mockLegacySmsPlan(),
                    convert: null,
                },
            })
            expect(mapBillingState(state).current_plans.sms?.product).toBe(
                ProductType.SMS,
            )
        })

        it('passes null for sms when absent', () => {
            expect(
                mapBillingState(
                    mockBillingState({
                        current_plans: {
                            helpdesk: mockLegacyHelpdeskPlan(),
                            automate: null,
                            voice: null,
                            sms: null,
                            convert: null,
                        },
                    }),
                ).current_plans.sms,
            ).toBeNull()
        })

        it('maps convert plan when present', () => {
            const state = mockBillingState({
                current_plans: {
                    helpdesk: mockLegacyHelpdeskPlan(),
                    automate: null,
                    voice: null,
                    sms: null,
                    convert: mockMeteredConvertPlan(),
                },
            })
            expect(mapBillingState(state).current_plans.convert?.product).toBe(
                ProductType.Convert,
            )
        })

        it('passes null for convert when absent', () => {
            expect(
                mapBillingState(
                    mockBillingState({
                        current_plans: {
                            helpdesk: mockLegacyHelpdeskPlan(),
                            automate: null,
                            voice: null,
                            sms: null,
                            convert: null,
                        },
                    }),
                ).current_plans.convert,
            ).toBeNull()
        })
    })

    describe('upcoming_invoice', () => {
        it('is null when the API returns null', () => {
            expect(
                mapBillingState(mockBillingState({ upcoming_invoice: null }))
                    .upcoming_invoice,
            ).toBeNull()
        })

        it('maps passthrough fields when present', () => {
            const state = mockBillingState({
                upcoming_invoice: mockUpcomingInvoiceSummary({
                    subtotal_decimal: '50.00',
                    total_decimal: '45.00',
                    subtotal_in_cents: 5000,
                    total_in_cents: 4500,
                }),
            })
            const invoice = mapBillingState(state).upcoming_invoice
            expect(invoice?.subtotal_decimal).toBe('50.00')
            expect(invoice?.total_decimal).toBe('45.00')
        })

        it('maps coupon products when present', () => {
            const state = mockBillingState({
                upcoming_invoice: mockUpcomingInvoiceSummary({
                    coupon: mockCouponSummary({
                        products: [API.ProductType.Helpdesk],
                    }),
                }),
            })
            expect(
                mapBillingState(state).upcoming_invoice?.coupon?.products,
            ).toEqual([ProductType.Helpdesk])
        })

        it('passes null coupon through', () => {
            const state = mockBillingState({
                upcoming_invoice: mockUpcomingInvoiceSummary({ coupon: null }),
            })
            expect(mapBillingState(state).upcoming_invoice?.coupon).toBeNull()
        })
    })
})
