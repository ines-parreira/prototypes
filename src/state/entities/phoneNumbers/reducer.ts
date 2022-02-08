import {createReducer} from '@reduxjs/toolkit'

import {PhoneNumber} from 'models/phoneNumber/types'

import {PhoneNumbersState} from './types'
import {
    phoneNumberCreated,
    phoneNumberDeleted,
    phoneNumberFetched,
    phoneNumbersFetched,
} from './actions'

const initialState: PhoneNumbersState = {}

const phoneNumbersReducer = createReducer<PhoneNumbersState>(
    initialState,
    (builder) =>
        builder
            .addCase(phoneNumberCreated, (state, {payload}) => {
                state[payload.id] = payload
            })
            .addCase(phoneNumberDeleted, (state, {payload}) => {
                delete state[payload]
            })
            .addCase(phoneNumberFetched, (state, {payload}) => {
                state[payload.id] = payload
            })
            .addCase(phoneNumbersFetched, (state, {payload}) => {
                payload.map((phoneNumber: PhoneNumber) => {
                    state[phoneNumber.id] = phoneNumber
                })
            })
)

export default phoneNumbersReducer
