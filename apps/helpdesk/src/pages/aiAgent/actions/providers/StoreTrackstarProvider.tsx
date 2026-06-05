import type { ReactNode } from 'react'

import { useListTrackstar } from '@gorgias/workflows-queries'

import type { StoreTrackstarContextType } from './StoreTrackstarContext'
import StoreTrackstarContext from './StoreTrackstarContext'

type Props = {
    storeName: string
    storeType: 'shopify'
    children?: ReactNode
}

const StoreTrackstarProvider = ({ storeName, storeType, children }: Props) => {
    const {
        data: connections = {},
        remove,
        refetch,
    } = useListTrackstar(storeType, storeName, {
        query: {
            select: (response) =>
                response.data.reduce<StoreTrackstarContextType['connections']>(
                    (acc, connection) => {
                        acc[connection.integration_name] = connection
                        return acc
                    },
                    {},
                ),
        },
    })

    return (
        <StoreTrackstarContext.Provider
            value={{
                connections,
                invalidate: () => {
                    remove()
                    refetch()
                },
                storeName,
                storeType,
            }}
        >
            {children}
        </StoreTrackstarContext.Provider>
    )
}

export default StoreTrackstarProvider
