export const DISCOUNT_TYPE = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    FREE_SHIPPING: 'free_shipping',
}

export const DISCOUNT_CHOICES = [
    { value: DISCOUNT_TYPE.PERCENTAGE, label: 'Percentage' },
    { value: DISCOUNT_TYPE.FIXED, label: 'Fixed amount' },
    { value: DISCOUNT_TYPE.FREE_SHIPPING, label: 'Free shipping' },
]

export const DISCOUNT_USE_TYPE = {
    NO_LIMIT: 'no-limit',
    ONE_PER_USER: 'one-per-user',
    ONE_USE: 'one-use',
}

export const DISCOUNT_USE_CHOICES = [
    { value: DISCOUNT_USE_TYPE.NO_LIMIT, label: 'No limit' },
    { value: DISCOUNT_USE_TYPE.ONE_PER_USER, label: 'One use per customer ' },
    {
        value: DISCOUNT_USE_TYPE.ONE_USE,
        label: 'One use, for only one customer',
    },
]

export const DISCOUNT_MODAL_NAME = 'ADD_DISCOUNT'
export const UNIQUE_DISCOUNT_MODAL_NAME = 'ADD_UNIQUE_DISCOUNT'
export const DELETE_DISCOUNT_MODAL_NAME = 'DELETE_DISCOUNT'

export const DISCOUNTS_PER_PAGE = 25
