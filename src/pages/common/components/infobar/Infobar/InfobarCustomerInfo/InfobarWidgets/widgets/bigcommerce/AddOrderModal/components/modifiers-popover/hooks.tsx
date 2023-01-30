import React, {useState} from 'react'
import {
    FloatingFocusManager,
    FloatingOverlay,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'
import {
    BigCommerceProduct,
    BigCommerceProductModifiers,
    BigCommerceProductVariant,
    bigCommerceProductCheckboxModifierTypes,
    bigCommerceProductSelectModifierTypes,
    bigCommerceProductSwatchModifierTypes,
} from 'models/integration/types'

import {useCanViewBigCommerceCreateOrderModifiers} from '../../utils'
import {ModifiersPopover} from './ModifiersPopover'

import css from './ModifiersPopover.less'

export type ModifierValues = Record<string, number | undefined>

export type ModifierErrors = Record<string, string | undefined>

export const useModifierValues = (modifiers: BigCommerceProductModifiers[]) => {
    const usableModifiers = modifiers.filter(({type}) =>
        [
            ...bigCommerceProductSelectModifierTypes,
            ...bigCommerceProductSwatchModifierTypes,
            ...bigCommerceProductCheckboxModifierTypes,
        ].includes(type)
    )

    const [modifierValues, setModifierValues] = useState<ModifierValues>(
        usableModifiers.reduce((accum, {id}) => {
            accum[id] = undefined

            return accum
        }, {} as ModifierValues)
    )

    const [modifierErrors, setModifierErrors] = useState<ModifierErrors>(
        usableModifiers.reduce((accum, {id}) => {
            accum[id] = undefined

            return accum
        }, {} as ModifierErrors)
    )

    const handleSetValue = (modifierId: number, optionId: number) => {
        // Reset error if it was previously set
        if (modifierErrors[modifierId]) {
            setModifierErrors({...modifierErrors, [modifierId]: undefined})
        }

        setModifierValues({
            ...modifierValues,
            [modifierId]: optionId,
        })
    }

    const handleValidate = () => {
        const newModifierErrors = Object.entries(modifierValues).reduce(
            (accum, [modifierId, modifierValue]) => {
                const modifier = modifiers.find(
                    ({id}) => id.toString() === modifierId
                )

                // Should not happen, but defense programming just in case
                if (!modifier) {
                    return accum
                }

                const checkboxModifierHasFalseValue =
                    modifierValue &&
                    modifier.type === 'checkbox' &&
                    modifier.required &&
                    modifier.option_values.find(({id}) => id === modifierValue)
                        ?.value_data.checked_value === false

                // Value is required but not set
                if (
                    (modifier?.required && !modifierValue) ||
                    checkboxModifierHasFalseValue
                ) {
                    accum[modifierId] =
                        modifier.type === 'checkbox'
                            ? 'Please check this box.'
                            : 'Please fill out this field.'

                    return accum
                }

                return accum
            },
            {} as ModifierErrors
        )

        const hasErrors = Object.values(newModifierErrors).some((value) =>
            Boolean(value)
        )

        if (hasErrors) {
            setModifierErrors(newModifierErrors)
        }

        return !hasErrors
    }

    return {modifierValues, modifierErrors, handleSetValue, handleValidate}
}

type State = {
    product: BigCommerceProduct
    variant: BigCommerceProductVariant
}

export const useModifiersPopover = (
    storeHash: string,
    onApply: (props: {
        product: BigCommerceProduct
        variant: BigCommerceProductVariant
        modifierValues: ModifierValues
    }) => void
) => {
    const canViewModifiers = useCanViewBigCommerceCreateOrderModifiers()

    const [props, setProps] = useState<State | null>(null)

    /**
     * If it returns false, the modifier won't get opened
     * If true - it will get opened
     */
    const maybeOpenModifierPopover = (props: State): boolean => {
        // Do not open if we do not have LD flag set
        if (!canViewModifiers) {
            return false
        }

        // Do not open if we do not have required modifiers
        if (!props.product.modifiers.some(({required}) => required)) {
            return false
        }

        setProps(props)

        return true
    }

    const {refs, context} = useFloating({open: Boolean(props)})
    const role = useRole(context)

    const {getReferenceProps} = useInteractions([role])

    const onClose = () => setProps(null)

    const modifiersPopover = props ? (
        <FloatingOverlay className={css.overlay}>
            <FloatingFocusManager context={context}>
                <ModifiersPopover
                    product={props.product}
                    variant={props.variant}
                    storeHash={storeHash}
                    onClose={onClose}
                    onApply={(modifierValues) => {
                        onApply({
                            product: props.product,
                            variant: props.variant,
                            modifierValues,
                        })

                        onClose()
                    }}
                    setReference={refs.setReference}
                />
            </FloatingFocusManager>
        </FloatingOverlay>
    ) : null

    return {
        getReferenceProps,
        setReference: refs.setReference,
        maybeOpenModifierPopover,
        modifiersPopover,
    }
}
