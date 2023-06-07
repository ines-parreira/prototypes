import React from 'react'
import {render} from '@testing-library/react'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import {createContextConsumer} from 'utils/testing'

import {
    ChatIntegrationPreviewContext,
    ChatIntegrationPreviewContextType,
} from '../ChatIntegrationPreviewContext'
import {ChatIntegrationPreviewProvider} from '../ChatIntegrationPreviewProvider'

const ChatIntegrationPreviewConsumer = createContextConsumer(
    ChatIntegrationPreviewContext
)

describe('ChatIntegrationPreviewProvider', () => {
    it('should provide default value', () => {
        const defaultValue: ChatIntegrationPreviewContextType = {}

        render(
            <ChatIntegrationPreviewProvider value={defaultValue}>
                <ChatIntegrationPreviewConsumer />
            </ChatIntegrationPreviewProvider>
        )

        expect(ChatIntegrationPreviewConsumer.getLastContextValue()).toBe(
            defaultValue
        )
    })

    it('should provide passed value', () => {
        const value: ChatIntegrationPreviewContextType = {
            avatar: {
                imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
                nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
            },
        }

        render(
            <ChatIntegrationPreviewProvider value={value}>
                <ChatIntegrationPreviewConsumer />
            </ChatIntegrationPreviewProvider>
        )

        expect(ChatIntegrationPreviewConsumer.getLastContextValue()).toBe(value)
    })
})
