import {PayloadActionCreator} from '@reduxjs/toolkit'

import {Event} from '../../../models/event/types'

import {EVENTS_FETCHED} from './constants'

export type AuditLogEventsState = {
    [key: string]: Event
}

export type AuditLogEventsAction = AuditLogEventsFetchedAction

export type AuditLogEventsFetchedAction = PayloadActionCreator<
    Event,
    typeof EVENTS_FETCHED
>
