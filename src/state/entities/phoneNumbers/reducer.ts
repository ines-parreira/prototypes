import { createReducer } from '@reduxjs/toolkit'

import { OldPhoneNumber } from 'models/phoneNumber/types'

import {
    phoneNumberCreated,
    phoneNumberDeleted,
    phoneNumberFetched,
    phoneNumbersFetched,
    phoneNumberUpdated,
} from './actions'
import { PhoneNumbersState } from './types'

const initialState: PhoneNumbersState = {}

const phoneNumbersReducer = createReducer<PhoneNumbersState>(
    initialState,
    (builder) =>
        builder
            .addCase(phoneNumberCreated, (state, { payload }) => {
                state[payload.id] = payload
            })
            .addCase(phoneNumberDeleted, (state, { payload }) => {
                delete state[payload]
            })
            .addCase(phoneNumberFetched, (state, { payload }) => {
                state[payload.id] = payload
            })
            .addCase(phoneNumberUpdated, (state, { payload }) => {
                state[payload.id] = payload
            })
            .addCase(phoneNumbersFetched, (state, { payload }) => {
                payload.map((phoneNumber: OldPhoneNumber) => {
                    state[phoneNumber.id] = phoneNumber
                })
            }),
)

export default phoneNumbersReducer
