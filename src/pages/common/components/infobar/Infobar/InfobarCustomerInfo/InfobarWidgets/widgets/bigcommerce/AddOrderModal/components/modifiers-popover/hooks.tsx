import React, {useEffect, useState} from 'react'
import {
    FloatingFocusManager,
    FloatingOverlay,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'
import {
    BigCommerceCartLineItem,
    BigCommerceProduct,
    BigCommerceProductModifiers,
    BigCommerceProductVariant,
} from 'models/integration/types'

import {ModifiersPopover} from './ModifiersPopover'

import css from './ModifiersPopover.less'
import {supportedBigCommerceModifierTypes} from './consts'

export type ModifierValues = Record<string, number | undefined>

export type ModifierErrors = Record<string, string | undefined>

export const useModifierValues = ({
    modifiers,
    lineItem,
    initialModifierValues,
}: {
    modifiers: BigCommerceProductModifiers[]
    lineItem?: BigCommerceCartLineItem
    initialModifierValues?: ModifierValues
}) => {
    const [isInitialValidationDone, setIsInitialValidationDone] =
        useState(false)

    const usableModifiers = modifiers.filter(({type}) =>
        supportedBigCommerceModifierTypes.includes(type)
    )

    const [modifierValues, setModifierValues] = useState<ModifierValues>(() => {
        const valuesFromUsableModifiers = usableModifiers.reduce(
            (accum, {id}) => {
                const option = lineItem?.options.find((option) => {
                    if ('nameId' in option) {
                        return option.nameId === id
                    }

                    return option.name_id === id
                })

                if (!option) {
                    accum[id] = undefined
                } else {
                    accum[id] =
                        'valueId' in option ? option?.valueId : option.value_id
                }

                return accum
            },
            {} as ModifierValues
        )

        return {...valuesFromUsableModifiers, ...initialModifierValues}
    })

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

    // `useEffect` which is using `handleValidate` does not depend on `handleValidate` identity to
    // trigger the wrapped function
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    useEffect(() => {
        if (
            !isInitialValidationDone &&
            initialModifierValues &&
            modifierValues
        ) {
            handleValidate()
            setIsInitialValidationDone(true)
        }
    }, [
        handleValidate,
        initialModifierValues,
        isInitialValidationDone,
        modifierValues,
    ])

    return {modifierValues, modifierErrors, handleSetValue, handleValidate}
}

type AddModifiersPopoverState = {
    product: BigCommerceProduct
    variant: BigCommerceProductVariant
    modifierValues?: ModifierValues
}

export const useAddModifiersPopover = (
    storeHash: string,
    onApply: (props: {
        product: BigCommerceProduct
        variant: BigCommerceProductVariant
        modifierValues: ModifierValues
    }) => Promise<void>
) => {
    const [props, setProps] = useState<AddModifiersPopoverState | null>(null)

    /**
     * If it returns false, the modifier won't get opened
     * If true - it will get opened
     */
    const maybeOpenModifierPopover = (
        props: AddModifiersPopoverState
    ): boolean => {
        // Do not open if we do not have required modifiers
        if (!(props.product.modifiers ?? []).some(({required}) => required)) {
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
                    initialModifierValues={props.modifierValues}
                    sku={props.variant.sku}
                    storeHash={storeHash}
                    onClose={onClose}
                    onApply={(modifierValues) => {
                        void onApply({
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

type EditModifiersPopoverState = {
    product: BigCommerceProduct
    lineItem: BigCommerceCartLineItem
}

export const useEditModifiersPopover = (
    storeHash: string,
    onApply: (props: {
        product: BigCommerceProduct
        modifierValues: ModifierValues
    }) => void
) => {
    const [props, setProps] = useState<EditModifiersPopoverState | null>(null)

    const {refs, context} = useFloating({open: Boolean(props)})
    const role = useRole(context)

    const {getReferenceProps} = useInteractions([role])

    const onClose = () => setProps(null)

    const modifiersPopover = props ? (
        <FloatingOverlay className={css.overlay}>
            <FloatingFocusManager context={context}>
                <ModifiersPopover
                    product={props.product}
                    sku={props.lineItem.sku}
                    lineItem={props.lineItem}
                    storeHash={storeHash}
                    onClose={onClose}
                    onApply={(modifierValues) => {
                        onApply({
                            product: props.product,
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
        openModifierPopover: setProps,
        modifiersPopover,
    }
}
