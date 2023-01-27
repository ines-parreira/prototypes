import {
    BigCommerceProductCheckboxModifier,
    BigCommerceProductModifiers,
    BigCommerceProductSelectModifier,
    BigCommerceProductSwatchModifier,
} from 'models/integration/types'

export const isSelectModifier = (
    modifier: BigCommerceProductModifiers
): modifier is BigCommerceProductSelectModifier =>
    [
        'radio_buttons',
        'rectangles',
        'dropdown',
        'product_list_with_images',
    ].includes(modifier.type)

export const isSwatchModifier = (
    modifier: BigCommerceProductModifiers
): modifier is BigCommerceProductSwatchModifier => modifier.type === 'swatch'

export const isCheckboxModifier = (
    modifier: BigCommerceProductModifiers
): modifier is BigCommerceProductCheckboxModifier =>
    modifier.type === 'checkbox'
