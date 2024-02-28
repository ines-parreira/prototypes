import {queryKeys} from '@gorgias/api-queries'
import {queryCache} from 'api/queryClient'
import {store} from 'common/store'
import {voiceCallsKeys} from 'models/voiceCall/queries'
import {updateQueryTimestamp} from 'state/queries/actions'

queryCache.subscribe((event) => {
    const {query, type} = event

    const subscribedEvents = ['added', 'removed', 'updated']
    const subscribedQueryKeys = [
        queryKeys.voiceCalls.all()[0],
        voiceCallsKeys.all()[0],
    ]

    if (
        subscribedEvents.includes(type) &&
        Array.isArray(query.queryKey) &&
        subscribedQueryKeys.includes(query.queryKey[0])
    ) {
        store.dispatch(updateQueryTimestamp(query.queryKey))
    }
})
