import React, {ReactNode} from 'react'

import {
    ChatIntegrationPreviewContext,
    ChatIntegrationPreviewContextType,
} from './ChatIntegrationPreviewContext'

type Props = {
    children?: ReactNode
    value: ChatIntegrationPreviewContextType
}

export const ChatIntegrationPreviewProvider = ({value, children}: Props) => {
    return (
        <ChatIntegrationPreviewContext.Provider value={value}>
            {children}
        </ChatIntegrationPreviewContext.Provider>
    )
}
