//@flow
import type {ActionCreatedBy} from '@reduxjs/toolkit'

import {fetchStatEnded, fetchStatStarted} from './actions.ts'

export type StatsState = {
    fetchingMap: {
        [string]: ?boolean,
    },
}

export type StatsAction = FetchStatEndedAction | FetchStatStartedAction

export type FetchStatEndedAction = ActionCreatedBy<typeof fetchStatEnded>

export type FetchStatStartedAction = ActionCreatedBy<typeof fetchStatStarted>
