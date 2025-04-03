import { ReactNode } from 'react'

import { useAiAgentFormChanges } from '../hooks/useAiAgentFormChanges'
import AiAgentFormChangesContext from './AiAgentFormChangesContext'

type Props = {
    children: ReactNode
}

const AiAgentFormChangesProvider = ({ children }: Props) => {
    const {
        isFormDirty,
        setIsFormDirty,
        setActionCallback,
        dirtySections,
        onModalSave,
        onModalDiscard,
        promptTriggerRef,
        onLeaveContext,
    } = useAiAgentFormChanges()

    return (
        <AiAgentFormChangesContext.Provider
            value={{
                isFormDirty,
                setIsFormDirty,
                setActionCallback,
                dirtySections,
                onModalSave,
                onModalDiscard,
                promptTriggerRef,
                onLeaveContext,
            }}
        >
            {children}
        </AiAgentFormChangesContext.Provider>
    )
}

export default AiAgentFormChangesProvider
