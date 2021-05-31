//@flow
import type {ActionCreatedBy} from '@reduxjs/toolkit'

import type {Stat} from '../../../models/stat/types.js'

import {statFetched} from './actions.ts'

export type StatsState = {
    [string]: ?Stat,
}

export type StatsAction = StatFetchedAction

export type StatFetchedAction = ActionCreatedBy<typeof statFetched>
