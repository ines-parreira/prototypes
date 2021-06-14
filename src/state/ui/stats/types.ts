import {PayloadActionCreator} from '@reduxjs/toolkit'

import {FETCH_STAT_ENDED, FETCH_STAT_STARTED} from './constants'

export type StatsState = {
    fetchingMap: {
        [key: string]: boolean | undefined
    }
}

export type StatsAction = FetchStatEndedAction | FetchStatStartedAction

export type FetchStatEndedAction = PayloadActionCreator<
    {statName: string; resourceName: string},
    typeof FETCH_STAT_ENDED
>

export type FetchStatStartedAction = PayloadActionCreator<
    {statName: string; resourceName: string},
    typeof FETCH_STAT_STARTED
>
