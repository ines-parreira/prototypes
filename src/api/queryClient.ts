import {QueryCache, QueryClient, Query, QueryKey} from '@tanstack/react-query'
import {store as reduxStore} from 'init'
import {updateQueryTimestamp} from 'state/queries/actions'

import {queryCacheConfigWithoutRedux} from './queryCacheConfig'

// /!\ Don’t put the redux store in the queryCacheConfig file, /!\
// /!\ it creates nasty circular dependencies /!\
export const appQueryClient = new QueryClient({
    queryCache: new QueryCache({
        ...queryCacheConfigWithoutRedux,
        onSuccess: (
            data: unknown,
            query: Query<unknown, unknown, unknown, QueryKey>
        ) => {
            queryCacheConfigWithoutRedux.onSuccess(data, query)
            reduxStore.dispatch(updateQueryTimestamp(query.queryKey))
        },
    }),
})
