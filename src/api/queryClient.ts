import {QueryCache, QueryClient} from '@tanstack/react-query'
import {store as reduxStore} from 'init'
import {updateQueryTimestamp} from 'state/queries/actions'

export const appQueryClient = new QueryClient({
    queryCache: new QueryCache({
        onSuccess: (_, query) => {
            reduxStore.dispatch(updateQueryTimestamp(query.queryKey))
        },
    }),
})
