import React, {ReactNode} from 'react'

import SynchronizedScrollTopContext, {
    defaultSynchronizedScrollTopValue,
} from '../SynchronizedScrollTopContext'

export default function SynchronizedScrollTopProvider({
    children,
}: {
    children?: ReactNode
}) {
    return (
        <SynchronizedScrollTopContext.Provider
            value={defaultSynchronizedScrollTopValue}
        >
            {children}
        </SynchronizedScrollTopContext.Provider>
    )
}
