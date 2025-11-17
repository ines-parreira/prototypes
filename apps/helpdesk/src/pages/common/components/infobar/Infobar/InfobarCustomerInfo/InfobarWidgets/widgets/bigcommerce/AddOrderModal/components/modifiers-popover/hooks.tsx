import { useEffect, useState } from 'react'

import type {
    BigCommerceCartLineItem,
    BigCommerceProductModifiers,
} from 'models/integration/types'

import { supportedBigCommerceModifierTypes } from './consts'
import type { ModifierErrors, ModifierValues } from './types'

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

    const usableModifiers = modifiers.filter(({ type }) =>
        supportedBigCommerceModifierTypes.includes(type),
    )

    const [modifierValues, setModifierValues] = useState<ModifierValues>(() => {
        const valuesFromUsableModifiers = usableModifiers.reduce(
            (accum, { id }) => {
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
            {} as ModifierValues,
        )

        return { ...valuesFromUsableModifiers, ...initialModifierValues }
    })

    const [modifierErrors, setModifierErrors] = useState<ModifierErrors>(
        usableModifiers.reduce((accum, { id }) => {
            accum[id] = undefined

            return accum
        }, {} as ModifierErrors),
    )

    const handleSetValue = (modifierId: number, optionId: number) => {
        // Reset error if it was previously set
        if (modifierErrors[modifierId]) {
            setModifierErrors({ ...modifierErrors, [modifierId]: undefined })
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
                    ({ id }) => id.toString() === modifierId,
                )

                // Should not happen, but defense programming just in case
                if (!modifier) {
                    return accum
                }

                const checkboxModifierHasFalseValue =
                    modifierValue &&
                    modifier.type === 'checkbox' &&
                    modifier.required &&
                    modifier.option_values.find(
                        ({ id }) => id === modifierValue,
                    )?.value_data.checked_value === false

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
            {} as ModifierErrors,
        )

        const hasErrors = Object.values(newModifierErrors).some((value) =>
            Boolean(value),
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
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [
        handleValidate,
        initialModifierValues,
        isInitialValidationDone,
        modifierValues,
    ]) /* eslint-enable react-hooks/exhaustive-deps */

    return { modifierValues, modifierErrors, handleSetValue, handleValidate }
}
