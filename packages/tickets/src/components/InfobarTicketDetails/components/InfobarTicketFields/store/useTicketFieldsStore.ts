import { isEmpty } from 'lodash'
import { create } from 'zustand'

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

type TicketFieldsStore = {
    fields: TicketFieldsState
    hasAttemptedToCloseTicket: boolean
    updateFieldState: (fieldState: CustomFieldState) => void
    updateFieldValue: (id: number, value: CustomFieldValue | undefined) => void
    updateFieldError: (id: number, hasError: boolean) => void
    updateFieldPrediction: (
        id: number,
        prediction: CustomFieldPrediction,
    ) => void
    setHasAttemptedToCloseTicket: (value: boolean) => void
    initializeFields: (fields: TicketFieldsState) => void
    resetFields: () => void
}

export const useTicketFieldsStore = create<TicketFieldsStore>((set, get) => ({
    fields: {},
    hasAttemptedToCloseTicket: false,
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
    setHasAttemptedToCloseTicket: (value) =>
        set({ hasAttemptedToCloseTicket: value }),
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
    resetFields: () => set({ fields: {}, hasAttemptedToCloseTicket: false }),
}))
