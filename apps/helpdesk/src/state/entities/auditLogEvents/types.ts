import type { PayloadActionCreator } from '@reduxjs/toolkit'

import type { Event } from '../../../models/event/types'
import type { EVENTS_FETCHED } from './constants'

export type AuditLogEventsState = {
    [key: string]: Event
}

export type AuditLogEventsAction = AuditLogEventsFetchedAction

export type AuditLogEventsFetchedAction = PayloadActionCreator<
    Event,
    typeof EVENTS_FETCHED
>
