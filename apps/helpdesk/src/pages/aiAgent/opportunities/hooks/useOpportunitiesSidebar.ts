import { useContext } from 'react'

import { DefaultExportOpportunitiesSidebarContext as OpportunitiesSidebarContext } from '../context/OpportunitiesSidebarContext'

export function useOpportunitiesSidebar() {
    const ctx = useContext(OpportunitiesSidebarContext)
    if (ctx === null) {
        throw new Error(
            '`useOpportunitiesSidebar` may not be used outside of an OpportunitiesSidebarProvider',
        )
    }

    return ctx
}
