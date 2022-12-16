import {createReducer} from '@reduxjs/toolkit'

import {NewPhoneNumber, OldPhoneNumber} from 'models/phoneNumber/types'

import {NewPhoneNumbersState, PhoneNumbersState} from './types'
import {
    phoneNumberCreated,
    phoneNumberDeleted,
    phoneNumberFetched,
    phoneNumberUpdated,
    phoneNumbersFetched,
    newPhoneNumbersFetched,
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
            .addCase(phoneNumberUpdated, (state, {payload}) => {
                state[payload.id] = payload
            })
            .addCase(phoneNumbersFetched, (state, {payload}) => {
                payload.map((phoneNumber: OldPhoneNumber) => {
                    state[phoneNumber.id] = phoneNumber
                })
            })
)

const newInitialState: NewPhoneNumbersState = {}

export const newPhoneNumbersReducer = createReducer<NewPhoneNumbersState>(
    newInitialState,
    (builder) =>
        builder.addCase(newPhoneNumbersFetched, (state, {payload}) => {
            payload.map((phoneNumber: NewPhoneNumber) => {
                state[phoneNumber.id] = phoneNumber
            })
        })
)

export default phoneNumbersReducer
