import {
    BigCommerceProductCheckboxModifier,
    bigCommerceProductCheckboxModifierTypes,
    BigCommerceProductModifiers,
    BigCommerceProductSelectModifier,
    bigCommerceProductSelectModifierTypes,
    BigCommerceProductSwatchModifier,
    bigCommerceProductSwatchModifierTypes,
} from 'models/integration/types'
import {OptionSelection} from 'models/integration/resources/bigcommerce'
import {ModifierValues} from './hooks'

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

export const modifierValuesToOptionSelections = (
    modifierValues: ModifierValues
): OptionSelection[] =>
    Object.entries(modifierValues)
        .filter(([, option_value]) => Boolean(option_value))
        .map(([option_id, option_value]) => ({
            option_id: parseInt(option_id),
            option_value: option_value!,
        }))
