import React, {ReactNode} from 'react'

import useSplitTicketViewContext from '../hooks/useSplitTicketViewContext'
import Context from '../Context'

type Props = {
    children: ReactNode
}

export default function Provider({children}: Props) {
    const ctx = useSplitTicketViewContext()

    return <Context.Provider value={ctx}>{children}</Context.Provider>
}
