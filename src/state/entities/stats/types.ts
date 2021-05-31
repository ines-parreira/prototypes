import {PayloadActionCreator} from '@reduxjs/toolkit'

import {Stat} from '../../../models/stat/types'

import {STAT_FETCHED} from './constants'

export type StatsState = {
    [key: string]: Stat | undefined
}

export type StatsAction = StatFetchedAction

export type StatFetchedAction = PayloadActionCreator<
    {id: string; data: Stat},
    typeof STAT_FETCHED
>
