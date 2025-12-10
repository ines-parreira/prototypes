import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { ToneOfVoice } from '../../constants'
import type { ValidFormValues } from '../../types'
import { filterNonNull } from '../../util'
import {
    getStoreConfigurationFromFormValues,
    isPreviewModeActivated,
} from './StoreConfigForm.utils'

jest.mock('../../util', () => ({
    filterNonNull: jest.fn(),
}))

describe('getStoreConfigurationFromFormValues', () => {
    const storeName = 'MyStore'
    const toneOfVoice = ToneOfVoice.Custom

    const formValuesPartial = {
        helpCenterId: 123,
        chatChannelDeactivatedDatetime: '2024-01-01',
        emailChannelDeactivatedDatetime: '2024-01-01',
        smsChannelDeactivatedDatetime: '2024-01-01',
        previewModeActivatedDatetime: '2024-02-01',
        previewModeValidUntilDatetime: '2024-02-08',
        monitoredEmailIntegrations: [
            { id: 1, email: 'email1@example.com' },
            { id: 2, email: 'email2@example.com' },
        ],
        monitoredChatIntegrations: [1, 2],
        monitoredSmsIntegrations: [],
        customToneOfVoiceGuidance: 'Be friendly',
        useEmailIntegrationSignature: true,
        signature: 'Best regards, Store',
        silentHandover: true,
        tags: [
            { name: 'tag1', description: 'description1' },
            { name: 'tag2', description: 'description2' },
        ],
        excludedTopics: ['topic1', 'topic2'],
        ticketSampleRate: 0.5,
        wizard: undefined,
        conversationBot: undefined,
        customFieldIds: [],
        handoverEmail: null,
        handoverMethod: null,
        handoverEmailIntegrationId: null,
        handoverHttpIntegrationId: null,
        smsDisclaimer: null,
    }

    const formValues: ValidFormValues = {
        ...formValuesPartial,
        toneOfVoice,
        aiAgentLanguage: null,
    }

    const filterNonNullResult = {
        silentHandover: true,
        tags: [
            { name: 'tag1', description: 'description1' },
            { name: 'tag2', description: 'description2' },
        ],
        excludedTopics: ['topic1', 'topic2'],
        ticketSampleRate: 0.5,
        toneOfVoice: ToneOfVoice.Professional,
    }

    beforeEach(() => {
        ;(filterNonNull as jest.Mock).mockReturnValue(filterNonNullResult)
    })

    afterEach(() => {
        ;(filterNonNull as jest.Mock).mockReset()
    })
    it('should return correct values', () => {
        const result = getStoreConfigurationFromFormValues(
            storeName,
            {
                ...formValues,
                toneOfVoice: ToneOfVoice.Professional,
            },
            getStoreConfigurationFixture({
                excludedTopics: ['topic1', 'topic2'],
            }),
        )

        expect(filterNonNull).toHaveBeenCalled()

        expect(result).toEqual({
            ...formValuesPartial,
            storeName,
            customToneOfVoiceGuidance: null,
            aiAgentLanguage: null,
            toneOfVoice: ToneOfVoice.Professional,
            silentHandover: true,
            tags: [
                { name: 'tag1', description: 'description1' },
                { name: 'tag2', description: 'description2' },
            ],
            excludedTopics: ['topic1', 'topic2'],
            ticketSampleRate: 0.5,
        })
    })

    describe('isPreviewModeActivated', () => {
        const aiAgentDisabledFormValues = {
            emailChannelDeactivatedDatetime: '2023-10-01T00:00:00Z',
            chatChannelDeactivatedDatetime: '2023-10-01T00:00:00Z',
        }

        it('returns true if preview mode is active and isPreviewModeActive is true', () => {
            const isPreviewModeActive = true

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                }),
            ).toBe(true)
        })

        it('returns false if preview mode is not active', () => {
            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                }),
            ).toBe(false)
        })

        it('returns false if previewModeValidUntilDatetime is not set', () => {
            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                }),
            ).toBe(false)
        })

        it('return false if AI Agent email is enabled and preview mode is set', () => {
            const isPreviewModeActive = true

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    emailChannelDeactivatedDatetime: null,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                }),
            ).toBe(false)
        })

        it('return false if AI Agent chat is enabled and preview mode is set', () => {
            const isPreviewModeActive = true

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    chatChannelDeactivatedDatetime: null,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                }),
            ).toBe(false)
        })

        it('return false if both AI Agent channels are enabled and preview mode is set', () => {
            const isPreviewModeActive = true

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    emailChannelDeactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                }),
            ).toBe(false)
        })
    })
})
