import React, { ReactNode } from 'react'

import Context from '../Context'
import useSplitTicketViewContext from '../hooks/useSplitTicketViewContext'

type Props = {
    children: ReactNode
}

export default function Provider({ children }: Props) {
    const ctx = useSplitTicketViewContext()

    return <Context.Provider value={ctx}>{children}</Context.Provider>
}
