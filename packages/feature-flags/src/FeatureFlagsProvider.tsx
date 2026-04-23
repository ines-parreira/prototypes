import type { ReactNode } from 'react'

import { SplitFactoryProvider } from '@splitsoftware/splitio-react'

import { getFactory } from './engines/harness'

type FeatureFlagsProviderProps = {
    children: ReactNode
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
    const factory = getFactory()

    return (
        <SplitFactoryProvider factory={factory ?? undefined}>
            {children}
        </SplitFactoryProvider>
    )
}
