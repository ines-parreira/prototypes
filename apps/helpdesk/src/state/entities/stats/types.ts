import type { PayloadActionCreator } from '@reduxjs/toolkit'

import type { Stat } from 'domains/reporting/models/stat/types'

import type { STAT_FETCHED } from './constants'

export type StatsState = {
    [key: string]: Stat | undefined
}

export type StatsAction = StatFetchedAction

export type StatFetchedAction = PayloadActionCreator<
    { id: string; data: Stat },
    typeof STAT_FETCHED
>
