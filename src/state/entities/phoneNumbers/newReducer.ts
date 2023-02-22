import {createReducer} from '@reduxjs/toolkit'

import {NewPhoneNumber} from 'models/phoneNumber/types'

import {NewPhoneNumbersState} from './types'
import {
    newPhoneNumberCreated,
    newPhoneNumberDeleted,
    newPhoneNumberFetched,
    newPhoneNumbersFetched,
    newPhoneNumberUpdated,
} from './actions'

const initialState: NewPhoneNumbersState = {}

export const newPhoneNumbersReducer = createReducer<NewPhoneNumbersState>(
    initialState,
    (builder) =>
        builder
            .addCase(newPhoneNumberCreated, (state, {payload}) => {
                state[payload.id] = payload
            })
            .addCase(newPhoneNumberDeleted, (state, {payload}) => {
                delete state[payload]
            })
            .addCase(newPhoneNumberFetched, (state, {payload}) => {
                state[payload.id] = payload
            })
            .addCase(newPhoneNumberUpdated, (state, {payload}) => {
                state[payload.id] = payload
            })
            .addCase(newPhoneNumbersFetched, (state, {payload}) => {
                payload.map((phoneNumber: NewPhoneNumber) => {
                    state[phoneNumber.id] = phoneNumber
                })
            })
)

export default newPhoneNumbersReducer
