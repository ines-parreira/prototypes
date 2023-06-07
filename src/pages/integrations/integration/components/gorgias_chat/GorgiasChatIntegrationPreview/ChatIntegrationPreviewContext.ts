import {createContext, useContext} from 'react'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

export type ChatIntegrationPreviewContextType = {
    avatar?: GorgiasChatAvatarSettings
}

export const ChatIntegrationPreviewContext =
    createContext<ChatIntegrationPreviewContextType>({})

export const useChatIntegrationPreviewContext = () =>
    useContext(ChatIntegrationPreviewContext)
