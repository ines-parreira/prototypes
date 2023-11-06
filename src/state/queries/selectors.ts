import {QueryKey} from '@tanstack/react-query'
import {createSelector} from 'reselect'
import {appQueryClient} from 'api/queryClient'
import {RootState} from 'state/types'
import {QueriesState} from './types'

export const getQueriesState = (state: {queries: QueriesState}): QueriesState =>
    state.queries

export const getQueryTimestamp = (queryKey: QueryKey) =>
    createSelector(
        getQueriesState,
        (state) => state?.timestamp[JSON.stringify(queryKey)]
    )

export const getQueryData = <T>(queryKey: QueryKey) =>
    createSelector(
        (state: RootState) => getQueryTimestamp(queryKey)(state),
        () => appQueryClient.getQueryData<T>(queryKey)
    )
