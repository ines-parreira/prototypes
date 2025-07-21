import { createContext, useContext } from 'react'

export type ActionCallback = {
    onSave?: () => Promise<unknown> | void
    onDiscard?: () => Promise<unknown> | void
}

export type AiAgentFormChangesContextType = {
    isFormDirty: boolean
    dirtySections: string[]
    promptTriggerRef: React.RefObject<{
        onLeaveContext: () => void
    }> | null
    setIsFormDirty: (section: string, isDirty: boolean) => void
    setActionCallback: (section: string, callback: ActionCallback) => void

    onModalSave: () => void
    onModalDiscard: () => void
    onLeaveContext: (callback?: ActionCallback) => void
}

const AiAgentFormChangesContext = createContext<AiAgentFormChangesContextType>({
    isFormDirty: false,
    dirtySections: [],
    setIsFormDirty: () => {},
    setActionCallback: () => {},
    promptTriggerRef: null,
    onModalSave: () => {},
    onModalDiscard: () => {},
    onLeaveContext: () => {},
})

export const useAiAgentFormChangesContext = () =>
    useContext(AiAgentFormChangesContext)

export default AiAgentFormChangesContext
