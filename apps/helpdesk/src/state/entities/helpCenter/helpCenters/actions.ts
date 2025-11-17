import { createAction } from '@reduxjs/toolkit'

import type { HelpCenter } from 'models/helpCenter/types'

import {
    HELPCENTER_CREATED,
    HELPCENTER_DELETED,
    HELPCENTER_FETCHED,
    HELPCENTER_UPDATED,
    HELPCENTERS_FETCHED,
} from './constants'

export const helpCenterCreated = createAction<HelpCenter>(HELPCENTER_CREATED)

export const helpCenterFetched = createAction<HelpCenter>(HELPCENTER_FETCHED)

export const helpCenterUpdated = createAction<HelpCenter>(HELPCENTER_UPDATED)

export const helpCentersFetched =
    createAction<HelpCenter[]>(HELPCENTERS_FETCHED)

export const helpCenterDeleted = createAction<number>(HELPCENTER_DELETED)
