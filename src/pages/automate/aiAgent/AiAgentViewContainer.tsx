import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
// import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

// import {QueryClientProvider, useQueryClient} from '@tanstack/react-query'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {AiAgentStoreView} from './AiAgentStoreView'

const AiAgentViewContainer = () => {
    // const queryClient = useQueryClient()

    // TODO: use the shopname to fetch the store configuration and rerender the AiAgentStoreView based on the shop name
    const {shopType} = useParams<{shopType: string; shopName: string}>()

    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate || shopType !== 'shopify') {
        return <Redirect to="/app/automation" />
    }

    return (
        // <QueryClientProvider client={queryClient}>
        <AiAgentStoreView />
        // <ReactQueryDevtools initialIsOpen={true} />
        // </QueryClientProvider>
    )
}

export default AiAgentViewContainer
