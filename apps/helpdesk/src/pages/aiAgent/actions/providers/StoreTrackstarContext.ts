import { createContext, useContext } from 'react'

import { UseQueryResult } from '@tanstack/react-query'

import { TrackstarConnection } from 'pages/automate/workflows/types'

export type StoreTrackstarContextType = {
    connections: Partial<{
        [integrationName in TrackstarConnection['integration_name']]: TrackstarConnection
    }>
    invalidate?: UseQueryResult['remove']
    storeName: string
    storeType: 'shopify'
}

const StoreTrackstarContext = createContext<StoreTrackstarContextType>({
    connections: {},
    storeName: '',
    storeType: 'shopify',
})

export const useStoreTrackstarContext = () => useContext(StoreTrackstarContext)

export default StoreTrackstarContext
