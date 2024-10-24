import {createReducer} from '@reduxjs/toolkit'

import {changeContactFormId} from './actions'
import {ContactFormState} from './types'

export const initialState: ContactFormState = {
    currentId: null,
}

export default createReducer<ContactFormState>(initialState, (builder) =>
    builder.addCase(changeContactFormId, (state, {payload}) => {
        state.currentId = payload
    })
)
