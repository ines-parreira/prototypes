import type { ReactNode } from 'react'
import React from 'react'

import { DefaultExportContext as Context } from '../Context'
import { useSplitTicketViewContext } from '../hooks/useSplitTicketViewContext'

type Props = {
    children: ReactNode
}

export function Provider({ children }: Props) {
    const ctx = useSplitTicketViewContext()

    return <Context.Provider value={ctx}>{children}</Context.Provider>
}
