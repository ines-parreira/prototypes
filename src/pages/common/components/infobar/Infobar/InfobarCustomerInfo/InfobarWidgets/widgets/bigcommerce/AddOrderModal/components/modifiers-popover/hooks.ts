import {useState} from 'react'
import {BigCommerceProductModifiers} from 'models/integration/types'

export type ModifierValues = Record<string, number | undefined>

export type ModifierErrors = Record<string, string | undefined>

export const useModifierValues = (modifiers: BigCommerceProductModifiers[]) => {
    const [modifierValues, setModifierValues] = useState<ModifierValues>(
        modifiers.reduce((accum, {id}) => {
            accum[id] = undefined

            return accum
        }, {} as ModifierValues)
    )

    const [modifierErrors, setModifierErrors] = useState<ModifierErrors>(
        modifiers.reduce((accum, {id}) => {
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

                // Value is required but not set
                if (modifier?.required && !modifierValue) {
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
