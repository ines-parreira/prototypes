import { useContext } from 'react'

import { NavBarContext } from './context'

export function useNavBar() {
    const context = useContext(NavBarContext)
    if (context === undefined) {
        throw new Error('useNavBar must be used within a NavBarProvider')
    }
    return context
}
