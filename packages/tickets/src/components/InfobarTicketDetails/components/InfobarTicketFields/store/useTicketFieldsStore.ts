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

export const useTicketFieldsStore = create<TicketFieldsStore>((set) => ({
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
    initializeFields: (fields) => set({ fields }),
    resetFields: () => set({ fields: {}, hasAttemptedToCloseTicket: false }),
}))
