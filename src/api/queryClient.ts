import {QueryCache, QueryClient} from '@tanstack/react-query'
import {store as reduxStore} from 'common/store'
import {updateQueryTimestamp} from 'state/queries/actions'

const queryCache = new QueryCache()

queryCache.subscribe((event) => {
    const {query, type} = event
    if (['added', 'removed', 'updated'].includes(type)) {
        reduxStore.dispatch(updateQueryTimestamp(query.queryKey))
    }
})

export const appQueryClient = new QueryClient({
    queryCache,
})
