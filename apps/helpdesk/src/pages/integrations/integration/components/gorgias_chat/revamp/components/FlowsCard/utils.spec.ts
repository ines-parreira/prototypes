import { TicketChannel } from 'business/types/ticket'
import { getLanguagesFromChatConfig } from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'
import { IntegrationType } from 'models/integration/constants'
import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { SelfServiceHelpCenterChannel } from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import type { SelfServiceStandaloneContactFormChannel } from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

import { getChannelLanguages } from './utils'

jest.mock('config/integrations/gorgias_chat', () => ({
    getLanguagesFromChatConfig: jest.fn(),
}))

const mockGetLanguagesFromChatConfig = jest.mocked(getLanguagesFromChatConfig)

const gorgiasChatIntegrationFixture: GorgiasChatIntegration = {
    id: 1,
    name: 'Test Chat',
    type: IntegrationType.GorgiasChat,
    uri: '/integrations/1',
    description: null,
    created_datetime: '2024-01-01T00:00:00.000Z',
    updated_datetime: '2024-01-01T00:00:00.000Z',
    deactivated_datetime: null,
    deleted_datetime: null,
    locked_datetime: null,
    managed: false,
    user: { id: 1 },
    decoration: {
        avatar_team_picture_url: null,
        avatar_type: 'agent',
        conversation_color: '#000000',
        introduction_text: 'Hello',
        main_color: '#000000',
        offline_introduction_text: 'We are offline',
        main_font_family: 'Inter',
        position: {
            alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
            offsetX: 0,
            offsetY: 0,
        },
    },
    meta: {
        languages: [{ language: Language.EnglishUs, primary: true }],
        self_service: { enabled: false },
    },
}

describe('getChannelLanguages', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return languages from chat config for Chat channel', () => {
        const mockLanguages = ['en-US', 'fr-FR', 'de-DE']
        mockGetLanguagesFromChatConfig.mockReturnValue(mockLanguages)

        const chatChannel: SelfServiceChatChannel = {
            type: TicketChannel.Chat,
            value: gorgiasChatIntegrationFixture,
        }

        const result = getChannelLanguages(chatChannel)

        expect(mockGetLanguagesFromChatConfig).toHaveBeenCalledWith(
            chatChannel.value.meta,
        )
        expect(result).toEqual(mockLanguages)
    })

    it('should return supported_locales for HelpCenter channel', () => {
        const helpCenterChannel: SelfServiceHelpCenterChannel = {
            type: TicketChannel.HelpCenter,
            value: {
                ...getSingleHelpCenterResponseFixture,
                supported_locales: ['en-US', 'es-ES'],
            },
        }

        const result = getChannelLanguages(helpCenterChannel)

        expect(result).toEqual(['en-US', 'es-ES'])
        expect(mockGetLanguagesFromChatConfig).not.toHaveBeenCalled()
    })

    it('should return default_locale array for ContactForm channel', () => {
        const contactFormChannel: SelfServiceStandaloneContactFormChannel = {
            type: TicketChannel.ContactForm,
            value: {
                ...ContactFormFixture,
                default_locale: 'fr-FR',
            },
        }

        const result = getChannelLanguages(contactFormChannel)

        expect(result).toEqual(['fr-FR'])
        expect(mockGetLanguagesFromChatConfig).not.toHaveBeenCalled()
    })

    it('should return empty array for unknown channel type', () => {
        const unknownChannel = {
            type: 'unknown-channel',
            value: { id: 1 },
        }

        // @ts-expect-error Testing unknown channel type behavior
        const result = getChannelLanguages(unknownChannel)

        expect(result).toEqual([])
        expect(mockGetLanguagesFromChatConfig).not.toHaveBeenCalled()
    })
})
