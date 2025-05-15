import { AiAgentScope } from 'models/aiAgent/types'
import { isSalesEnabledWithNewActivationXp } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { assumeMock } from 'utils/testing'

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

jest.mock('pages/aiAgent/Activation/hooks/storeActivationReducer')
const isSalesEnabledWithNewActivationXpMock = assumeMock(
    isSalesEnabledWithNewActivationXp,
)

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
        signature: 'Best regards, Store',
        silentHandover: true,
        tags: [
            { name: 'tag1', description: 'description1' },
            { name: 'tag2', description: 'description2' },
        ],
        excludedTopics: ['topic1', 'topic2'],
        ticketSampleRate: 0.5,
        wizard: undefined,
        customFieldIds: [],
    }

    const formValues: ValidFormValues = {
        ...formValuesPartial,
        toneOfVoice,
    }

    const filterNonNullResult = {
        silentHandover: true,
        tags: [
            { name: 'tag1', description: 'description1' },
            { name: 'tag2', description: 'description2' },
        ],
        excludedTopics: ['topic1', 'topic2'],
        ticketSampleRate: 0.5,
    }

    beforeEach(() => {
        ;(filterNonNull as jest.Mock).mockReturnValue(filterNonNullResult)
    })

    afterEach(() => {
        ;(filterNonNull as jest.Mock).mockReset()
    })
    it('should return correct values and keep existing scope when AiAgentNewActivationXp=false', () => {
        const result = getStoreConfigurationFromFormValues(
            storeName,
            {
                ...formValues,
                toneOfVoice: ToneOfVoice.Professional,
            },
            getStoreConfigurationFixture({
                excludedTopics: ['topic1', 'topic2'],
                scopes: [AiAgentScope.Sales, AiAgentScope.Support],
            }),
            {
                hasNewAutomatePlan: false,
                isAiSalesBetaUser: false,
                aiSalesAgentEmailEnabled: false,
                hasAiAgentNewActivationXp: false,
            },
        )

        expect(filterNonNull).toHaveBeenCalled()

        expect(result).toEqual({
            ...formValuesPartial,
            storeName,
            customToneOfVoiceGuidance: null,
            scopes: [AiAgentScope.Sales, AiAgentScope.Support],
        })
    })

    it.each([
        { emailEnabled: true, chatEnabled: true },
        { emailEnabled: false, chatEnabled: true },
        { emailEnabled: true, chatEnabled: false },
    ])(
        'should set support scope when emailEnabled=$emailEnabled + chatEnabled=$chatEnabled settings when AiAgentNewActivationXp=true',
        ({ chatEnabled, emailEnabled }) => {
            const emailChannelDeactivatedDatetime = emailEnabled
                ? null
                : new Date().toISOString()
            const chatChannelDeactivatedDatetime = chatEnabled
                ? null
                : new Date().toISOString()
            const result = getStoreConfigurationFromFormValues(
                storeName,
                {
                    ...formValues,
                    toneOfVoice: ToneOfVoice.Professional,
                    emailChannelDeactivatedDatetime,
                    chatChannelDeactivatedDatetime,
                },
                getStoreConfigurationFixture({
                    excludedTopics: ['topic1', 'topic2'],
                    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
                }),
                {
                    hasNewAutomatePlan: false,
                    isAiSalesBetaUser: false,
                    aiSalesAgentEmailEnabled: false,
                    hasAiAgentNewActivationXp: true,
                },
            )

            expect(filterNonNull).toHaveBeenCalled()

            expect(result).toEqual({
                ...formValuesPartial,
                storeName,
                customToneOfVoiceGuidance: null,
                emailChannelDeactivatedDatetime,
                chatChannelDeactivatedDatetime,
                scopes: [AiAgentScope.Support],
            })
        },
    )

    it('should set sales scope when isSalesEnabledWithNewActivationXpMock returns true and AiAgentNewActivationXp=true', () => {
        isSalesEnabledWithNewActivationXpMock.mockReturnValue(true)
        const result = getStoreConfigurationFromFormValues(
            storeName,
            {
                ...formValues,
                toneOfVoice: ToneOfVoice.Professional,
            },
            getStoreConfigurationFixture({
                excludedTopics: ['topic1', 'topic2'],
                scopes: [AiAgentScope.Sales, AiAgentScope.Support],
            }),
            {
                hasNewAutomatePlan: false,
                isAiSalesBetaUser: false,
                aiSalesAgentEmailEnabled: false,
                hasAiAgentNewActivationXp: true,
            },
        )

        expect(filterNonNull).toHaveBeenCalled()

        expect(result).toEqual({
            ...formValuesPartial,
            storeName,
            customToneOfVoiceGuidance: null,
            scopes: [AiAgentScope.Sales],
        })
    })

    it('should not set sales scope when isSalesEnabledWithNewActivationXpMock returns true and AiAgentNewActivationXp=true', () => {
        isSalesEnabledWithNewActivationXpMock.mockReturnValue(false)
        const result = getStoreConfigurationFromFormValues(
            storeName,
            {
                ...formValues,
                toneOfVoice: ToneOfVoice.Professional,
            },
            getStoreConfigurationFixture({
                excludedTopics: ['topic1', 'topic2'],
                scopes: [AiAgentScope.Sales, AiAgentScope.Support],
            }),
            {
                hasNewAutomatePlan: false,
                isAiSalesBetaUser: false,
                aiSalesAgentEmailEnabled: false,
                hasAiAgentNewActivationXp: true,
            },
        )

        expect(filterNonNull).toHaveBeenCalled()

        expect(result).toEqual({
            ...formValuesPartial,
            storeName,
            customToneOfVoiceGuidance: null,
            scopes: [],
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
