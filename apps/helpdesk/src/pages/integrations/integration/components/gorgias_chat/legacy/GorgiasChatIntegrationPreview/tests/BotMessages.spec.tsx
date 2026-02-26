import type React from 'react'

import { render } from '@testing-library/react'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import BotMessages from '../BotMessages'
import { ChatIntegrationPreviewContext } from '../ChatIntegrationPreview'

describe('<BotMessages />', () => {
    const minProps: React.ComponentProps<typeof BotMessages> = {
        chatTitle: 'Acme Support',
        className: 'test-class',
        messages: ['Hello!', 'How can I help you?'],
    }

    it('should display bot icon', () => {
        const {
            container: { firstChild },
        } = render(
            <ChatIntegrationPreviewContext.Provider
                value={{
                    displayBotLabel: true,
                    avatar: {
                        imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
                        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                    },
                }}
            >
                <BotMessages {...minProps}>
                    <div>test</div>
                </BotMessages>
            </ChatIntegrationPreviewContext.Provider>,
        )

        expect(firstChild).toMatchSnapshot()
    })

    it('should display company logo', () => {
        const {
            container: { firstChild },
        } = render(
            <ChatIntegrationPreviewContext.Provider
                value={{
                    displayBotLabel: true,
                    avatar: {
                        imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
                        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                        companyLogoUrl: 'company-logo-url.jpg',
                    },
                }}
            >
                <BotMessages {...minProps}>
                    <div>test</div>
                </BotMessages>
            </ChatIntegrationPreviewContext.Provider>,
        )

        expect(firstChild).toMatchSnapshot()
    })
})
