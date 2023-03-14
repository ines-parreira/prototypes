import {createReducer} from '@reduxjs/toolkit'
import {ContactFormState} from './types'
import {changeContactFormId} from './actions'

export const initialState: ContactFormState = {
    currentId: null,
}

export default createReducer<ContactFormState>(initialState, (builder) =>
    builder.addCase(changeContactFormId, (state, {payload}) => {
        state.currentId = payload
    })
)
