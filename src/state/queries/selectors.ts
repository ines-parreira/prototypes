import {createSelector} from '@reduxjs/toolkit'
import {QueryKey} from '@tanstack/react-query'
import {QueriesState} from './types'

export const getQueriesState = (state: {queries: QueriesState}): QueriesState =>
    state.queries

export const getQueryTimestamp = (queryKey: QueryKey) =>
    createSelector(
        getQueriesState,
        (state) => state?.timestamp[JSON.stringify(queryKey)]
    )
