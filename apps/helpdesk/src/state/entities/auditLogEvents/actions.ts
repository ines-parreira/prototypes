import { createAction } from '@reduxjs/toolkit'

import type { Event } from '../../../models/event/types'
import { EVENTS_FETCHED } from './constants'

export const auditLogEventsFetched = createAction<Event[]>(EVENTS_FETCHED)
