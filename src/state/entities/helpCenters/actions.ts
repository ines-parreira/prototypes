import {createAction} from '@reduxjs/toolkit'

import {HelpCenter} from '../../../models/helpCenter/types'

import {
    HELPCENTERS_FETCHED,
    HELPCENTER_CREATED,
    HELPCENTER_FETCHED,
    HELPCENTER_UPDATED,
    HELPCENTER_DELETED,
} from './constants'

export const helpCenterCreated = createAction<HelpCenter>(HELPCENTER_CREATED)

export const helpCenterFetched = createAction<HelpCenter>(HELPCENTER_FETCHED)

export const helpCenterUpdated = createAction<HelpCenter>(HELPCENTER_UPDATED)

export const helpCentersFetched =
    createAction<HelpCenter[]>(HELPCENTERS_FETCHED)

export const helpCenterDeleted = createAction<number>(HELPCENTER_DELETED)
