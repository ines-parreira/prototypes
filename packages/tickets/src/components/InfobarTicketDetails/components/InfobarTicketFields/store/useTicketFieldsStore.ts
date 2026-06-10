import { isEmpty } from 'lodash'
import { create } from 'zustand'

import { getNumberOrUndefined } from '../../../../InfobarCustomerFields/utils'

export type CustomFieldValue = string | number | boolean

export type CustomFieldPrediction = {
    confidence: number
    confirmed: boolean
    display: boolean
    modified: boolean
    predicted: string
}

export type CustomFieldState = {
    id: number
    value?: CustomFieldValue
    hasError?: boolean
    prediction?: CustomFieldPrediction
}

export type TicketFieldsState = {
    [fieldId: string]: CustomFieldState
}

export type NumberFieldValueChange =
    | {
          hasChanged: false
      }
    | {
          hasChanged: true
          value: number | undefined
      }

export function getNumberFieldValueChange({
    currentValue,
    nextValue,
}: {
    currentValue: CustomFieldValue | undefined
    nextValue: number | undefined
}): NumberFieldValueChange {
    if (getNumberOrUndefined(currentValue) === nextValue) {
        return { hasChanged: false }
    }

    return { hasChanged: true, value: nextValue }
}

type TicketFieldsStore = {
    fields: TicketFieldsState
    /**
     * This validation count is used to trigger the expansion of the ticket fields overflow list
     * when there are validation errors.
     */
    validationFailureCount: number
    updateFieldState: (fieldState: CustomFieldState) => void
    updateFieldValue: (id: number, value: CustomFieldValue | undefined) => void
    /**
     * NumberField can emit the same committed value from both change and blur
     * before React re-renders, so this action dedupes against latest store state.
     */
    updateNumberFieldValueIfChanged: (
        id: number,
        value: number | undefined,
    ) => NumberFieldValueChange
    updateFieldError: (id: number, hasError: boolean) => void
    updateFieldPrediction: (
        id: number,
        prediction: CustomFieldPrediction,
    ) => void
    incrementValidationFailureCount: () => void
    initializeFields: (fields: TicketFieldsState) => void
    resetFields: () => void
}

export const useTicketFieldsStore = create<TicketFieldsStore>((set, get) => ({
    fields: {},
    validationFailureCount: 0,
    updateFieldState: (fieldState) =>
        set((state) => ({
            fields: {
                ...state.fields,
                [fieldState.id]: fieldState,
            },
        })),
    updateFieldValue: (id, value) =>
        set((state) => ({
            fields: {
                ...state.fields,
                [id]: {
                    ...state.fields[id],
                    id,
                    value,
                    hasError: false,
                },
            },
        })),
    updateNumberFieldValueIfChanged: (id, value) => {
        const change = getNumberFieldValueChange({
            currentValue: get().fields[id]?.value,
            nextValue: value,
        })

        if (!change.hasChanged) {
            return change
        }

        set((state) => ({
            fields: {
                ...state.fields,
                [id]: {
                    ...state.fields[id],
                    id,
                    value: change.value,
                    hasError: false,
                },
            },
        }))

        return change
    },
    updateFieldError: (id, hasError) =>
        set((state) => ({
            fields: {
                ...state.fields,
                [id]: {
                    ...state.fields[id],
                    id,
                    hasError,
                },
            },
        })),
    updateFieldPrediction: (id, prediction) =>
        set((state) => ({
            fields: {
                ...state.fields,
                [id]: {
                    ...state.fields[id],
                    id,
                    prediction,
                },
            },
        })),
    incrementValidationFailureCount: () =>
        set((state) => ({
            validationFailureCount: state.validationFailureCount + 1,
        })),
    initializeFields: (newFields) => {
        const currentFields = get().fields
        if (isEmpty(currentFields) && isEmpty(newFields)) {
            return
        }

        // Resetting the current fields
        if (!isEmpty(currentFields) && isEmpty(newFields)) {
            return set({ fields: {} })
        }

        // Merge the new fields with the current fields which have an errors state
        // We do this to prevent the sync from SDK cache update to the Zustand store
        // from resetting the fields to their default error state on the change.
        // This prevents all errors state from being cleared by one input change
        const currentFieldsWithErrors = Object.keys(
            currentFields,
        ).reduce<TicketFieldsState>((acc, key) => {
            const currentField = currentFields[key]
            if (currentField.hasError) {
                acc[key] = currentField
            }
            return acc
        }, {} as TicketFieldsState)

        const mergedFields = {
            ...currentFieldsWithErrors,
            ...newFields,
        }

        return set({ fields: mergedFields })
    },
    resetFields: () => set({ fields: {}, validationFailureCount: 0 }),
}))
