export const DISCOUNT_TYPE = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    FREE_SHIPPING: 'free_shipping',
}

export const DISCOUNT_CHOICES = [
    {value: DISCOUNT_TYPE.PERCENTAGE, label: 'Percentage'},
    {value: DISCOUNT_TYPE.FIXED, label: 'Fixed amount'},
    {value: DISCOUNT_TYPE.FREE_SHIPPING, label: 'Free shipping'},
]

export const DISCOUNT_MODAL_NAME = 'ADD_DISCOUNT'

export const DISCOUNTS_PER_PAGE = 25
