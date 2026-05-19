import * as API from '@gorgias/helpdesk-types'

import type {
    AutomatePlan,
    BillingState,
    ConvertPlan,
    CouponSummary,
    HelpdeskPlan,
    HelpdeskPlanFeatures,
    SMSOrVoicePlan,
} from 'models/billing/types'
import {
    BillingAddressValidationStatus,
    Cadence,
    HelpdeskPlanTier,
    ProductType,
    SubscriptionStatus,
} from 'models/billing/types'

function parseProductType(productType: API.ProductType): ProductType {
    switch (productType) {
        case API.ProductType.Helpdesk:
            return ProductType.Helpdesk
        case API.ProductType.Automation:
            return ProductType.Automation
        case API.ProductType.Voice:
            return ProductType.Voice
        case API.ProductType.Sms:
            return ProductType.SMS
        case API.ProductType.Convert:
            return ProductType.Convert
        default:
            const __: never = productType
            throw new Error(`Unknown product type: ${productType}`)
    }
}

function parseProductTypeArray(productTypes: API.ProductType[]): ProductType[] {
    return productTypes.map(parseProductType)
}

function parseSubscriptionStatus(
    status: API.SubscriptionStatus,
): SubscriptionStatus {
    switch (status) {
        case API.SubscriptionStatus.Active:
            return SubscriptionStatus.ACTIVE
        case API.SubscriptionStatus.Canceled:
            return SubscriptionStatus.CANCELED
        case API.SubscriptionStatus.Incomplete:
            return SubscriptionStatus.INCOMPLETE
        case API.SubscriptionStatus.IncompleteExpired:
            return SubscriptionStatus.INCOMPLETE_EXPIRED
        case API.SubscriptionStatus.PastDue:
            return SubscriptionStatus.PAST_DUE
        case API.SubscriptionStatus.Trialing:
            return SubscriptionStatus.TRIALING
        case API.SubscriptionStatus.Unpaid:
            return SubscriptionStatus.UNPAID
        default:
            const __: never = status
            throw new Error(`Unknown subscription status: ${status}`)
    }
}

function parseBillingAddressValidationStatus(
    status: API.BillingAddressValidationStatus,
): BillingAddressValidationStatus {
    switch (status) {
        case API.BillingAddressValidationStatus.NotValidated:
            return BillingAddressValidationStatus.NotValidated
        case API.BillingAddressValidationStatus.Valid:
            return BillingAddressValidationStatus.Valid
        case API.BillingAddressValidationStatus.PartiallyValid:
            return BillingAddressValidationStatus.PartiallyValid
        case API.BillingAddressValidationStatus.Invalid:
            return BillingAddressValidationStatus.Invalid
        default:
            const __: never = status
            throw new Error(
                `Unknown billing address validation status: ${status}`,
            )
    }
}

function parseHelpdeskPlanTier(tier: API.HelpdeskPlanTier): HelpdeskPlanTier {
    switch (tier) {
        case API.HelpdeskPlanTier.Starter:
            return HelpdeskPlanTier.STARTER
        case API.HelpdeskPlanTier.Basic:
            return HelpdeskPlanTier.BASIC
        case API.HelpdeskPlanTier.Advanced:
            return HelpdeskPlanTier.ADVANCED
        case API.HelpdeskPlanTier.Pro:
            return HelpdeskPlanTier.PRO
        case API.HelpdeskPlanTier.Custom:
            return HelpdeskPlanTier.CUSTOM
        case API.HelpdeskPlanTier.Other:
            return HelpdeskPlanTier.OTHER
        default:
            const __: never = tier
            throw new Error(`Unknown helpdesk plan tier: ${tier}`)
    }
}

function parseCadence(cadence: API.Interval): Cadence {
    switch (cadence) {
        case API.Interval.Month:
            return Cadence.Month
        case API.Interval.Year:
            return Cadence.Year
        default:
            const __: never = cadence
            throw new Error(`Unknown cadence: ${cadence}`)
    }
}

function mapCoupon(coupon: API.CouponSummary): CouponSummary {
    return {
        ...coupon,
        products: parseProductTypeArray(coupon.products),
    }
}

export function mapBillingState(state: API.BillingState): BillingState {
    return {
        upcoming_invoice:
            state.upcoming_invoice !== null
                ? {
                      ...state.upcoming_invoice,
                      coupon:
                          state.upcoming_invoice.coupon !== null
                              ? mapCoupon(state.upcoming_invoice.coupon)
                              : null,
                  }
                : null,
        subscription: {
            ...state.subscription,
            status: parseSubscriptionStatus(state.subscription.status),
            cadence: parseCadence(state.subscription.cadence),
            coupon:
                state.subscription.coupon !== null
                    ? mapCoupon(state.subscription.coupon)
                    : null,
        },
        customer: {
            ...state.customer,
            coupon:
                state.customer.coupon != null
                    ? mapCoupon(state.customer.coupon)
                    : null,
            billing_address_validation_status:
                state.customer.billing_address_validation_status != null
                    ? parseBillingAddressValidationStatus(
                          state.customer.billing_address_validation_status,
                      )
                    : state.customer.billing_address_validation_status,
        },
        current_plans: {
            helpdesk: {
                ...state.current_plans.helpdesk,
                product: parseProductType(
                    state.current_plans.helpdesk.product!,
                ),
                cadence: parseCadence(state.current_plans.helpdesk.cadence),
                custom: state.current_plans.helpdesk.custom ?? false,
                features: {
                    ...state.current_plans.helpdesk.features.automate_features,
                    ...state.current_plans.helpdesk.features.helpdesk_features,
                } satisfies HelpdeskPlanFeatures,
                tier:
                    state.current_plans.helpdesk.tier !== undefined
                        ? parseHelpdeskPlanTier(
                              state.current_plans.helpdesk.tier,
                          )
                        : undefined,
            } satisfies HelpdeskPlan,
            automate:
                state.current_plans.automate !== null
                    ? ({
                          ...state.current_plans.automate,
                          product: parseProductType(
                              state.current_plans.automate.product!,
                          ),
                          num_quota_tickets:
                              state.current_plans.automate.num_quota_tickets!,
                          cadence: parseCadence(
                              state.current_plans.automate.cadence,
                          ),
                      } satisfies AutomatePlan)
                    : null,
            voice:
                state.current_plans.voice !== null
                    ? ({
                          ...state.current_plans.voice,
                          product: parseProductType(
                              state.current_plans.voice.product!,
                          ),
                          cadence: parseCadence(
                              state.current_plans.voice.cadence,
                          ),
                      } satisfies SMSOrVoicePlan)
                    : null,
            sms:
                state.current_plans.sms !== null
                    ? ({
                          ...state.current_plans.sms,
                          product: parseProductType(
                              state.current_plans.sms.product!,
                          ),
                          cadence: parseCadence(
                              state.current_plans.sms.cadence,
                          ),
                      } satisfies SMSOrVoicePlan)
                    : null,
            convert:
                state.current_plans.convert !== null
                    ? ({
                          ...state.current_plans.convert,
                          product: parseProductType(
                              state.current_plans.convert.product!,
                          ),
                          cadence: parseCadence(
                              state.current_plans.convert.cadence,
                          ),
                          extra_ticket_cost:
                              state.current_plans.convert.extra_ticket_cost!,
                      } satisfies ConvertPlan)
                    : null,
        },
    }
}
