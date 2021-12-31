import {createReducer} from '@reduxjs/toolkit'

import {PhoneNumber} from 'models/phoneNumber/types'

import {PhoneNumbersState} from './types'
import {
    phoneNumberCreated,
    phoneNumberFetched,
    phoneNumbersFetched,
} from './actions'

const initialState: PhoneNumbersState = {}

const phoneNumbersReducer = createReducer<PhoneNumbersState>(
    initialState,
    (builder) =>
        builder
            .addCase(phoneNumberCreated, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(phoneNumberFetched, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(phoneNumbersFetched, (state, {payload}) => {
                payload.map((phoneNumber: PhoneNumber) => {
                    state[phoneNumber.id.toString()] = phoneNumber
                })
            })
)

export default phoneNumbersReducer
