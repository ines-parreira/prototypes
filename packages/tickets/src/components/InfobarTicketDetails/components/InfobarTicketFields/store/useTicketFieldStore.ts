import { useShallow } from 'zustand/react/shallow'

import { useTicketFieldsStore } from './useTicketFieldsStore'

export const useTicketFieldStore = (fieldId: number) => {
    return useTicketFieldsStore(
        useShallow((state) => ({
            fieldState: state.fields[fieldId],
            updateFieldValue: state.updateFieldValue,
            updateFieldError: state.updateFieldError,
            updateFieldState: state.updateFieldState,
        })),
    )
}
