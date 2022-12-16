import {createReducer} from '@reduxjs/toolkit'

import {NewPhoneNumber} from 'models/phoneNumber/types'

import {NewPhoneNumbersState} from './types'
import {newPhoneNumbersFetched} from './actions'

const initialState: NewPhoneNumbersState = {}

export const newPhoneNumbersReducer = createReducer<NewPhoneNumbersState>(
    initialState,
    (builder) =>
        builder.addCase(newPhoneNumbersFetched, (state, {payload}) => {
            payload.map((phoneNumber: NewPhoneNumber) => {
                state[phoneNumber.id] = phoneNumber
            })
        })
)

export default newPhoneNumbersReducer
