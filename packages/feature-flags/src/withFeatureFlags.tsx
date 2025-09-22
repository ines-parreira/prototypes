import type { ComponentType } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

export const withFeatureFlags = <P extends object>(
    Component: ComponentType<P>,
) => {
    return (props: P) => {
        const flags = useFlags()

        return <Component {...props} flags={flags} />
    }
}
