import {QuickFilterType} from '../types/QuickFilter'

export const CONTAINS_PRODUCT_CARDS = {
    id: 'contains-product-cards',
    label: 'Contains product cards',
}

export const CONTAINS_DISCOUNT_CODES = {
    id: 'contains-discount-codes',
    label: 'Contains discount codes',
}

export const TRIGGERED_ON_EXIT_INTENT = {
    id: 'triggered-on-exit-intent',
    label: 'Triggered on exit intent',
}

export const TRIGGERED_OUTSIDE_BUSINESS_HOURS = {
    id: 'triggered-outside-business-hours',
    label: 'Triggered outside business hours',
}

export const AB_GROUP_TESTS = {
    id: 'ab-tests',
    label: 'A/B Tests',
}

export const QUICK_FILTERS: QuickFilterType[] = [
    CONTAINS_PRODUCT_CARDS,
    CONTAINS_DISCOUNT_CODES,
    TRIGGERED_ON_EXIT_INTENT,
    TRIGGERED_OUTSIDE_BUSINESS_HOURS,
    AB_GROUP_TESTS,
]

export default QUICK_FILTERS
