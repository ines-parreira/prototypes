import { useContext } from 'react'

import Context from '../Context'

export function usePanels() {
    const ctx = useContext(Context)
    return ctx
}
