import {createAction} from '@reduxjs/toolkit'

import {FETCH_STAT_ENDED, FETCH_STAT_STARTED} from './constants'

export const fetchStatStarted = createAction<{
    statName: string
    resourceName: string
}>(FETCH_STAT_STARTED)

export const fetchStatEnded = createAction<{
    statName: string
    resourceName: string
}>(FETCH_STAT_ENDED)
