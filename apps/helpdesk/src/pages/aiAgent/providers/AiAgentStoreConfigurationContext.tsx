import { createContext, useContext } from 'react'

import {
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'

export type AiAgentStoreConfigurationContextType = {
    storeConfiguration: StoreConfiguration | undefined
    isLoading: boolean
    updateStoreConfiguration: (
        configurationToSubmit: StoreConfiguration,
    ) => Promise<void>
    createStoreConfiguration: (
        configurationToSubmit: CreateStoreConfigurationPayload,
    ) => Promise<void>
    isPendingCreateOrUpdate: boolean
}

const AiAgentStoreConfigurationContext =
    createContext<AiAgentStoreConfigurationContextType>({
        storeConfiguration: undefined,
        isLoading: false,
        createStoreConfiguration: async () => {},
        updateStoreConfiguration: async () => {},
        isPendingCreateOrUpdate: false,
    })

export const useAiAgentStoreConfigurationContext = () =>
    useContext(AiAgentStoreConfigurationContext)

export default AiAgentStoreConfigurationContext
