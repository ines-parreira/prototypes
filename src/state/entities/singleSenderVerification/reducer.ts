import {createReducer} from '@reduxjs/toolkit'

import {SingleSenderVerificationsState} from './types'
import {removeVerification, setVerification} from './actions'

const initialState: SingleSenderVerificationsState = {}

const singleSenderReducer = createReducer<SingleSenderVerificationsState>(
    initialState,
    (builder) =>
        builder
            .addCase(setVerification, (state, {payload}) => {
                state[payload.integration_id] = payload
            })
            .addCase(removeVerification, (state, {payload}) => {
                delete state[payload]
            })
)

export default singleSenderReducer
