import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { ToneOfVoice } from '../../constants'
import { ValidFormValues } from '../../types'
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
        trialModeActivatedDatetime: '2024-02-01',
        previewModeActivatedDatetime: '2024-02-01',
        previewModeValidUntilDatetime: '2024-02-08',
        monitoredEmailIntegrations: [
            { id: 1, email: 'email1@example.com' },
            { id: 2, email: 'email2@example.com' },
        ],
        monitoredChatIntegrations: [1, 2],
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
            trialModeActivatedDatetime: '2023-10-01T00:00:00Z',
            emailChannelDeactivatedDatetime: '2023-10-01T00:00:00Z',
            chatChannelDeactivatedDatetime: '2023-10-01T00:00:00Z',
        }

        it('returns true if trial mode is available and trialModeActivatedDatetime is set', () => {
            const isTrialModeAvailable = true

            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(true)
        })

        it('returns false if trial mode is available but trialModeActivatedDatetime is not set', () => {
            const isTrialModeAvailable = true
            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    trialModeActivatedDatetime: null,
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })

        it('returns true if preview mode is available and isPreviewModeActive is true', () => {
            const isTrialModeAvailable = false

            const isPreviewModeActive = true

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    trialModeActivatedDatetime: null,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(true)
        })

        it('returns false if preview mode is available but isPreviewModeActive is not set', () => {
            const isTrialModeAvailable = false
            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    trialModeActivatedDatetime: null,
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })

        it('returns false if neither trial mode nor preview mode is available', () => {
            const isTrialModeAvailable = false

            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    trialModeActivatedDatetime: null,
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })

        it('return false if AI Agent email is enabled and trial mode is set', () => {
            const isTrialModeAvailable = true

            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    emailChannelDeactivatedDatetime: null,
                    trialModeActivatedDatetime: '2023-10-01T00:00:00Z',
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })

        it('return false if AI Agent chat is enabled and trial mode is set', () => {
            const isTrialModeAvailable = true
            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    chatChannelDeactivatedDatetime: null,
                    trialModeActivatedDatetime: '2023-10-01T00:00:00Z',
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })

        it('return false if AI agent global toggle is enabled and trial mode is set', () => {
            const isTrialModeAvailable = true
            const isPreviewModeActive = false

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    trialModeActivatedDatetime: '2023-10-01T00:00:00Z',
                    emailChannelDeactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: null,
                    previewModeValidUntilDatetime: null,
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })

        it('return false if AI Agent email is enabled and preview mode is set', () => {
            const isTrialModeAvailable = false

            const isPreviewModeActive = true

            expect(
                isPreviewModeActivated({
                    ...aiAgentDisabledFormValues,
                    emailChannelDeactivatedDatetime: null,
                    trialModeActivatedDatetime: '2023-10-01T00:00:00Z',
                    previewModeValidUntilDatetime: '2023-10-01T00:00:00Z',
                    isPreviewModeActive: isPreviewModeActive,
                    isTrialModeAvailable,
                }),
            ).toBe(false)
        })
    })
})
