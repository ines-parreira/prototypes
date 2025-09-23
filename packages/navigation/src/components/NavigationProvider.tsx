import type { ReactNode } from 'react'

import { NavigationContext } from '../contexts/NavigationContext'
import { useNavigationContext } from '../hooks/useNavigationContext'

type Props = {
    children: ReactNode
}

export function NavigationProvider({ children }: Props) {
    const ctx = useNavigationContext()

    return (
        <NavigationContext.Provider value={ctx}>
            {children}
        </NavigationContext.Provider>
    )
}
