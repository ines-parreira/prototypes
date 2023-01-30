import {
    BigCommerceProductCheckboxModifier,
    bigCommerceProductCheckboxModifierTypes,
    BigCommerceProductModifiers,
    BigCommerceProductSelectModifier,
    bigCommerceProductSelectModifierTypes,
    BigCommerceProductSwatchModifier,
    bigCommerceProductSwatchModifierTypes,
} from 'models/integration/types'

export const isSelectModifier = (
    modifier: BigCommerceProductModifiers
): modifier is BigCommerceProductSelectModifier =>
    bigCommerceProductSelectModifierTypes.includes(modifier.type as any)

export const isSwatchModifier = (
    modifier: BigCommerceProductModifiers
): modifier is BigCommerceProductSwatchModifier =>
    bigCommerceProductSwatchModifierTypes.includes(modifier.type as any)

export const isCheckboxModifier = (
    modifier: BigCommerceProductModifiers
): modifier is BigCommerceProductCheckboxModifier =>
    bigCommerceProductCheckboxModifierTypes.includes(modifier.type as any)
