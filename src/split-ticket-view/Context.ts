import {createContext} from 'react'

import useSplitTicketViewContext from './hooks/useSplitTicketViewContext'

export type ContextType = ReturnType<typeof useSplitTicketViewContext> | null

export default createContext<ContextType>(null)
