import { useContext } from 'react'

import { NavigationContext } from '../contexts/NavigationContext'
import type { NavigationContextValue } from '../types'

export function useNavigation(): NavigationContextValue {
    const ctx = useContext(NavigationContext)
    if (!ctx) {
        throw new Error(
            '`useNavigation` may only be used within a `NavigationProvider`.',
        )
    }

    return ctx
}
