import {createReducer} from '@reduxjs/toolkit'

import {Event} from '../../../models/event/types'

import {AuditLogEventsState} from './types'
import {auditLogEventsFetched} from './actions'

const initialState: AuditLogEventsState = {}

const auditLogEventsReducer = createReducer<AuditLogEventsState>(
    initialState,
    (builder) =>
        builder.addCase(auditLogEventsFetched, (state, {payload}) => {
            payload.map((event: Event) => {
                state[event.id.toString()] = event
            })
        })
)

export default auditLogEventsReducer
