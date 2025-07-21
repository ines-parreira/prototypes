import { useContext } from 'react'

import Context from '../Context'

export default function usePanels() {
    const ctx = useContext(Context)
    if (!ctx) {
        throw new Error('usePanels may only be used within Panels')
    }

    return ctx
}
