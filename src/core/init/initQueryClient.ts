import {queryCache} from 'api/queryClient'
import {store} from 'common/store'
import {updateQueryTimestamp} from 'state/queries/actions'

queryCache.subscribe((event) => {
    const {query, type} = event
    if (['added', 'removed', 'updated'].includes(type)) {
        store.dispatch(updateQueryTimestamp(query.queryKey))
    }
})
