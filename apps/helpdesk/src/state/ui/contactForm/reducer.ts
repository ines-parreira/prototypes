import { createReducer } from '@reduxjs/toolkit'

import { changeContactFormId } from './actions'
import type { ContactFormState } from './types'

export const initialState: ContactFormState = {
    currentId: null,
}

const DefaultExportReducer = createReducer<ContactFormState>(
    initialState,
    (builder) =>
        builder.addCase(changeContactFormId, (state, { payload }) => {
            state.currentId = payload
        }),
)

export { DefaultExportReducer }
