import { createContext, useContext } from 'react'

type Actions = {
    canRead: boolean
    canWrite: boolean
}

type TicketViewActions = {
    canRead: boolean
    canCreateInternalNote: boolean
    canWrite: boolean
}

export type StandaloneAiContextType = {
    isStandaloneAiAgent: boolean
    accessFeaturesMapped: {
        statistics: Actions
        userManagement: Actions
        ticketsView: TicketViewActions
    }
}

export const StandaloneAiContext = createContext<
    StandaloneAiContextType | undefined
>(undefined)

export const useStandaloneAiContext = () => {
    const context = useContext(StandaloneAiContext)
    if (!context) {
        throw new Error(
            'useStandaloneAiContext must be used within a StandaloneAiProvider',
        )
    }
    return context
}
