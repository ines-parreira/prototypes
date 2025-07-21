import {
    bigCommerceProductCheckboxModifierTypes,
    bigCommerceProductSelectModifierTypes,
    bigCommerceProductSwatchModifierTypes,
} from 'models/integration/types'

export const supportedBigCommerceModifierTypes = [
    ...bigCommerceProductSelectModifierTypes,
    ...bigCommerceProductSwatchModifierTypes,
    ...bigCommerceProductCheckboxModifierTypes,
]
