import { ReactNode } from 'react'

import type { LDFlagSet } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'

export type CategoryLink = {
    className?: string
    requiredRole?: UserRole
    requiredFeatureFlags?: FeatureFlagKey[]
    text: string
    to: string
    extra?: ReactNode
    outerExtra?: ReactNode
    isHidden?: boolean
}

export type Category = {
    icon: string
    links: CategoryLink[]
    name: string
    shouldRender?: (flags: LDFlagSet) => boolean
}
