import {createSelector} from '@reduxjs/toolkit'
import {RootState} from 'state/types'
import {QueriesState, QueryKey} from './types'

export const getQueriesState = (state: RootState): QueriesState => state.queries

export const getQueryTimestamp = (queryKey: QueryKey) =>
    createSelector(getQueriesState, (state) => state.timestamp[queryKey])
