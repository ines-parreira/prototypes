import {createAction} from '@reduxjs/toolkit'

import {Stat} from '../../../models/stat/types'

import {STAT_FETCHED} from './constants'

export const statFetched = createAction<{
    statName: string
    resourceName: string
    value: Stat
}>(STAT_FETCHED)
