import {createReducer} from '@reduxjs/toolkit'

import {removeVerification, setVerification} from './actions'
import {SingleSenderVerificationsState} from './types'

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
