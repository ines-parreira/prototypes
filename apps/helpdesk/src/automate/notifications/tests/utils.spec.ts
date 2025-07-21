import { ldClientMock } from 'jest-launchdarkly-mock'

import { OnboardingNotificationState } from 'models/aiAgent/types'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import { getLDClient } from 'utils/launchDarkly'

import { AiAgentNotificationType } from '../types'
import {
    getNotificationParams,
    getNotificationReceivedDatetime,
    getNotificationReceivedDatetimePayload,
    isNotificationAlreadyReceived,
} from '../utils'

describe('getNotificationParams', () => {
    const basePayload = {
        shop_name: 'store_1',
        shop_type: 'shopify',
        ticket_id: '12345',
    }

    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    it('should return correct params for StartAiAgentSetup', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.StartAiAgentSetup,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Set up AI Agent',
            subtitle:
                'We noticed you checking out AI Agent. It only takes a few steps to start automating 60% of your tickets!',
            redirectTo: '/app/ai-agent/shopify/store_1',
        })
    })

    it('should return correct params for FinishAiAgentSetup', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.FinishAiAgentSetup,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Finish AI Agent setup',
            subtitle:
                'You’re only a few steps away from getting AI Agent ready to start automating 60% of your tickets!',
            redirectTo: '/app/ai-agent/shopify/store_1/new',
        })
    })

    it('should return correct params for ActivateAiAgent', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type: AiAgentNotificationType.ActivateAiAgent,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Activate AI Agent',
            subtitle:
                'You’re just one click away from automating 60% of your tickets!',
            redirectTo: '/app/ai-agent/shopify/store_1/settings',
        })
    })

    it('should return correct params for MeetAiAgent', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type: AiAgentNotificationType.MeetAiAgent,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Meet your new team member: AI Agent',
            subtitle:
                'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
            redirectTo: '/app/ai-agent/shopify/store_1',
        })
    })

    it('should return correct params for FirstAiAgentTicket with valid ticket view ID', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.FirstAiAgentTicket,
        }

        const result = getNotificationParams(payload, 123)

        expect(result).toEqual({
            title: 'AI Agent answered its first ticket',
            subtitle:
                'Review AI Agent’s response and leave feedback in the ticket to improve its performance.',
            redirectTo: '/app/views/123/12345',
        })
    })

    it('should return correct params for ScrapingProcessingFinished', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.ScrapingProcessingFinished,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Your AI Agent knowledge is ready!',
            subtitle:
                'We’ve finished syncing your store store_1 so AI Agent can use it to answer tickets.',
            redirectTo: '/app/ai-agent/shopify/store_1/knowledge',
        })
    })

    it('should return null for unsupported notification series', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                'unsupported-series' as AiAgentNotificationType,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toBeNull()
    })
})

describe('getNotificationReceivedDatetimePayload', () => {
    it('should return correct received datetime payload for StartAiAgentSetup', () => {
        const result = getNotificationReceivedDatetimePayload(
            AiAgentNotificationType.StartAiAgentSetup,
        )
        expect(result).toHaveProperty(
            'startAiAgentSetupNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for FinishAiAgentSetup', () => {
        const result = getNotificationReceivedDatetimePayload(
            AiAgentNotificationType.FinishAiAgentSetup,
        )
        expect(result).toHaveProperty(
            'finishAiAgentSetupNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for ActivateAiAgent', () => {
        const result = getNotificationReceivedDatetimePayload(
            AiAgentNotificationType.ActivateAiAgent,
        )
        expect(result).toHaveProperty(
            'activateAiAgentNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for MeetAiAgent', () => {
        const result = getNotificationReceivedDatetimePayload(
            AiAgentNotificationType.MeetAiAgent,
        )
        expect(result).toHaveProperty('meetAiAgentNotificationReceivedDatetime')
    })

    it('should return correct received datetime payload for FirstAiAgentTicket', () => {
        const result = getNotificationReceivedDatetimePayload(
            AiAgentNotificationType.FirstAiAgentTicket,
        )
        expect(result).toHaveProperty(
            'firstAiAgentTicketNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for ScrapingProcessingFinished', () => {
        const result = getNotificationReceivedDatetimePayload(
            AiAgentNotificationType.ScrapingProcessingFinished,
        )
        expect(result).toHaveProperty('scrapingProcessingFinishedDatetime')
    })

    it('should return an empty object for unsupported notification types', () => {
        const result = getNotificationReceivedDatetimePayload(
            'unsupported-series' as AiAgentNotificationType,
        )
        expect(result).toEqual({})
    })
})

describe('isNotificationAlreadyReceived', () => {
    const baseState: OnboardingNotificationState =
        getOnboardingNotificationStateFixture()

    it('should return false if onboardingNotificationState is undefined', () => {
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.StartAiAgentSetup,
            undefined,
        )
        expect(result).toBe(false)
    })

    it('should return false if notification has not been received', () => {
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.StartAiAgentSetup,
            baseState,
        )
        expect(result).toBe(false)
    })

    it('should return true if StartAiAgentSetup notification has been received', () => {
        const state = {
            ...baseState,
            startAiAgentSetupNotificationReceivedDatetime:
                '2024-12-01T12:00:00Z',
        }
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.StartAiAgentSetup,
            state,
        )
        expect(result).toBe(true)
    })

    it('should return true if FinishAiAgentSetup notification has been received', () => {
        const state = {
            ...baseState,
            finishAiAgentSetupNotificationReceivedDatetime:
                '2024-12-01T12:00:00Z',
        }
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.FinishAiAgentSetup,
            state,
        )
        expect(result).toBe(true)
    })

    it('should return true if ActivateAiAgent notification has been received', () => {
        const state = {
            ...baseState,
            activateAiAgentNotificationReceivedDatetime: '2024-12-01T12:00:00Z',
        }
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.ActivateAiAgent,
            state,
        )
        expect(result).toBe(true)
    })

    it('should return true if MeetAiAgent notification has been received', () => {
        const state = {
            ...baseState,
            meetAiAgentNotificationReceivedDatetime: '2024-12-01T12:00:00Z',
        }
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.MeetAiAgent,
            state,
        )
        expect(result).toBe(true)
    })

    it('should return true if FirstAiAgentTicket notification has been received', () => {
        const state = {
            ...baseState,
            firstAiAgentTicketNotificationReceivedDatetime:
                '2024-12-01T12:00:00Z',
        }
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.FirstAiAgentTicket,
            state,
        )
        expect(result).toBe(true)
    })

    it('should return true if ScrapingProcessingFinished notification has been received', () => {
        const state = {
            ...baseState,
            scrapingProcessingFinishedDatetime: '2024-12-01T12:00:00Z',
        }
        const result = isNotificationAlreadyReceived(
            AiAgentNotificationType.ScrapingProcessingFinished,
            state,
        )
        expect(result).toBe(true)
    })

    it('should return false for unsupported notification types', () => {
        const result = isNotificationAlreadyReceived(
            'unsupported-series' as AiAgentNotificationType,
            baseState,
        )
        expect(result).toBe(false)
    })
})

describe('getNotificationReceivedDatetime', () => {
    const baseState: OnboardingNotificationState =
        getOnboardingNotificationStateFixture()

    it('should return null if no onboarding notification has been received', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.StartAiAgentSetup,
            baseState,
        )
        expect(result).toBe(null)
    })

    it('should return correct received datetime for StartAiAgentSetup', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.StartAiAgentSetup,
            {
                ...baseState,
                startAiAgentSetupNotificationReceivedDatetime:
                    '2024-12-01T12:00:00Z',
            },
        )
        expect(result).toBe('2024-12-01T12:00:00Z')
    })

    it('should return correct received datetime for FinishAiAgentSetup', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.FinishAiAgentSetup,
            {
                ...baseState,
                finishAiAgentSetupNotificationReceivedDatetime:
                    '2024-12-01T12:00:00Z',
            },
        )
        expect(result).toBe('2024-12-01T12:00:00Z')
    })

    it('should return correct received datetime for ActivateAiAgent', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.ActivateAiAgent,
            {
                ...baseState,
                activateAiAgentNotificationReceivedDatetime:
                    '2024-12-01T12:00:00Z',
            },
        )
        expect(result).toBe('2024-12-01T12:00:00Z')
    })

    it('should return correct received datetime for MeetAiAgent', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.MeetAiAgent,
            {
                ...baseState,
                meetAiAgentNotificationReceivedDatetime: '2024-12-01T12:00:00Z',
            },
        )
        expect(result).toBe('2024-12-01T12:00:00Z')
    })

    it('should return correct received datetime for FirstAiAgentTicket', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.FirstAiAgentTicket,
            {
                ...baseState,
                firstAiAgentTicketNotificationReceivedDatetime:
                    '2024-12-01T12:00:00Z',
            },
        )
        expect(result).toBe('2024-12-01T12:00:00Z')
    })

    it('should return correct received datetime for ScrapingProcessingFinished', () => {
        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.ScrapingProcessingFinished,
            {
                ...baseState,
                scrapingProcessingFinishedDatetime: '2024-12-01T12:00:00Z',
            },
        )
        expect(result).toBe('2024-12-01T12:00:00Z')
    })

    it('should return null for unsupported notification types', () => {
        const result = getNotificationReceivedDatetime(
            'unsupported-series' as AiAgentNotificationType,
            baseState,
        )
        expect(result).toBe(null)
    })
})
