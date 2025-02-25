import React, { useRef } from 'react'
import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'

import Client from '../Client'
import Context from '../Context'

type Props = {
    children: ReactNode
}

export default function ClientProvider({ children }: Props) {
    const { feedClient } = useKnockFeed()
    const clientRef = useRef<Client | null>(null)
    if (!clientRef.current) {
        clientRef.current = new Client(feedClient)
    }

    return (
        <Context.Provider value={clientRef.current}>
            {children}
        </Context.Provider>
    )
}
