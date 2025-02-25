import { createReducer } from '@reduxjs/toolkit'

import { Event } from '../../../models/event/types'
import { auditLogEventsFetched } from './actions'
import { AuditLogEventsState } from './types'

const initialState: AuditLogEventsState = {}

const auditLogEventsReducer = createReducer<AuditLogEventsState>(
    initialState,
    (builder) =>
        builder.addCase(auditLogEventsFetched, (state, { payload }) => {
            const newState: AuditLogEventsState = {}
            payload.map((event: Event) => {
                newState[event.id.toString()] = event
            })
            return newState
        }),
)

export default auditLogEventsReducer
