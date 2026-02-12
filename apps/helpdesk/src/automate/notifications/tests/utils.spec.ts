import type { OnboardingNotificationState } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'

import { AiAgentNotificationType } from '../types'
import {
    getNotificationParams,
    getNotificationReceivedDatetime,
    getNotificationReceivedDatetimePayload,
    isLessThan24HoursAgo,
    isNotificationAlreadyReceived,
    isTrialNotificationOfType,
} from '../utils'

const basePayload = {
    shop_name: 'store_1',
    shop_type: 'shopify',
    ticket_id: '12345',
}
describe('getNotificationParams', () => {
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
            redirectTo: '/app/ai-agent/shopify/store_1/onboarding',
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

    it('should return correct params for AiShoppingAssistantTrialRequest with agent info', () => {
        jest.spyOn(
            require('services/notificationTracker/notificationTracker'),
            'getAgent',
        ).mockReturnValue({ name: 'Test Agent' })

        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            agent_id: 123,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'New message',
            subtitle: '<b>Trial request</b> from <b>Test Agent</b>',
            excerpt:
                'Test Agent has expressed interest in trying out the Shopping Assistant for 14 days at no additional cost.',
            redirectTo: '/app/ai-agent/shopify/store_1/sales?from=notification',
        })
    })

    it('should handle AiShoppingAssistantTrialRequest when agent is not found', () => {
        jest.spyOn(
            require('services/notificationTracker/notificationTracker'),
            'getAgent',
        ).mockReturnValue(undefined)

        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            agent_id: 123,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'New message',
            subtitle: '<b>Trial request</b> from <b>Your team</b>',
            excerpt:
                'Your team has expressed interest in trying out the Shopping Assistant for 14 days at no additional cost.',
            redirectTo: '/app/ai-agent/shopify/store_1/sales?from=notification',
        })
    })

    it('should return correct params for AiAgentTrialRequest with agent info', () => {
        jest.spyOn(
            require('services/notificationTracker/notificationTracker'),
            'getAgent',
        ).mockReturnValue({ name: 'Test Agent' })

        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.AiAgentTrialRequest,
            agent_id: 123,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'New message',
            subtitle: '<b>Trial request</b> from <b>Test Agent</b>',
            excerpt:
                'Test Agent wants to try out AI Agent for 14 days for store_1 for free.',
            redirectTo: '/app/ai-agent/shopify/store_1/trial?from=notification',
        })
    })

    it('should handle AiAgentTrialRequest when agent is not found', () => {
        jest.spyOn(
            require('services/notificationTracker/notificationTracker'),
            'getAgent',
        ).mockReturnValue(undefined)

        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.AiAgentTrialRequest,
            agent_id: 123,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'New message',
            subtitle: '<b>Trial request</b> from <b>Your team</b>',
            excerpt:
                'Your team wants to try out AI Agent for 14 days for store_1 for free.',
            redirectTo: '/app/ai-agent/shopify/store_1/trial?from=notification',
        })
    })

    it('should return correct params for NewOpportunityGenerated', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.NewOpportunityGenerated,
            opportunity_ids: [123, 456],
            total_tickets: 15,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'New opportunities to improve AI Agent',
            subtitle:
                'We found 2 opportunities affecting 15 tickets. Review and apply high-impact fixes to improve responses.',
            redirectTo: '/app/ai-agent/shopify/store_1/opportunities/123',
        })
    })

    it('should return null if there is no ids', () => {
        const payload = {
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.NewOpportunityGenerated,
            opportunity_ids: [],
            total_tickets: 10,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual(null)
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
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.StartAiAgentSetup,
        })
        expect(result).toHaveProperty(
            'startAiAgentSetupNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for FinishAiAgentSetup', () => {
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.FinishAiAgentSetup,
        })
        expect(result).toHaveProperty(
            'finishAiAgentSetupNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for ActivateAiAgent', () => {
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type: AiAgentNotificationType.ActivateAiAgent,
        })
        expect(result).toHaveProperty(
            'activateAiAgentNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for MeetAiAgent', () => {
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type: AiAgentNotificationType.MeetAiAgent,
        })
        expect(result).toHaveProperty('meetAiAgentNotificationReceivedDatetime')
    })

    it('should return correct received datetime payload for FirstAiAgentTicket', () => {
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.FirstAiAgentTicket,
        })
        expect(result).toHaveProperty(
            'firstAiAgentTicketNotificationReceivedDatetime',
        )
    })

    it('should return correct received datetime payload for ScrapingProcessingFinished', () => {
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.ScrapingProcessingFinished,
        })
        expect(result).toHaveProperty('scrapingProcessingFinishedDatetime')
    })

    it('should create new trial request notification when user does not exist', () => {
        const userId = 123
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            agent_id: userId,
        })

        expect(result).toHaveProperty('trialRequestNotification')
        expect(result.trialRequestNotification).toHaveLength(1)
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'userId',
            userId,
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'receivedDatetime',
        )
    })

    it('should update existing trial request notification when user already exists', () => {
        const userId = 123
        const existingDatetime = '2024-01-01T00:00:00Z'
        const existingState = {
            ...getOnboardingNotificationStateFixture(),
            trialRequestNotification: [
                { userId, receivedDatetime: existingDatetime },
            ],
        }

        const result = getNotificationReceivedDatetimePayload(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                agent_id: userId,
            },
            existingState,
        )

        expect(result).toHaveProperty('trialRequestNotification')
        expect(result.trialRequestNotification).toHaveLength(1)
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'userId',
            userId,
        )
        expect(result.trialRequestNotification?.[0].receivedDatetime).not.toBe(
            existingDatetime,
        )
    })

    it('should add new trial request notification when different user requests trial', () => {
        const existingUserId = 123
        const newUserId = 456
        const existingDatetime = '2024-01-01T00:00:00Z'
        const existingState = {
            ...getOnboardingNotificationStateFixture(),
            trialRequestNotification: [
                { userId: existingUserId, receivedDatetime: existingDatetime },
            ],
        }

        const result = getNotificationReceivedDatetimePayload(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                agent_id: newUserId,
            },
            existingState,
        )

        expect(result).toHaveProperty('trialRequestNotification')
        expect(result.trialRequestNotification).toHaveLength(2)
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'userId',
            existingUserId,
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'receivedDatetime',
            existingDatetime,
        )
        expect(result.trialRequestNotification?.[1]).toHaveProperty(
            'userId',
            newUserId,
        )
        expect(result.trialRequestNotification?.[1]).toHaveProperty(
            'receivedDatetime',
        )
    })

    it('should create new AI Agent trial request notification when user does not exist', () => {
        const userId = 123

        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                AiAgentNotificationType.AiAgentTrialRequest,
            agent_id: userId,
        })

        expect(result).toHaveProperty('trialRequestNotification')
        expect(result.trialRequestNotification).toHaveLength(1)
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'userId',
            userId,
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'receivedDatetime',
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'trialType',
            TrialType.AiAgent,
        )
    })

    it('should update existing AI Agent trial request notification when user already exists', () => {
        const userId = 123
        const existingDatetime = '2024-01-01T00:00:00Z'
        const existingState = {
            ...getOnboardingNotificationStateFixture(),
            trialRequestNotification: [
                {
                    userId,
                    receivedDatetime: existingDatetime,
                    trialType: TrialType.AiAgent,
                },
            ],
        }

        const result = getNotificationReceivedDatetimePayload(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiAgentTrialRequest,
                agent_id: userId,
            },
            existingState,
        )

        expect(result).toHaveProperty('trialRequestNotification')
        expect(result.trialRequestNotification).toHaveLength(1)
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'userId',
            userId,
        )
        expect(result.trialRequestNotification?.[0].receivedDatetime).not.toBe(
            existingDatetime,
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'trialType',
            TrialType.AiAgent,
        )
    })

    it('should add new AI Agent trial request notification when different user requests trial', () => {
        const existingUserId = 123
        const newUserId = 456
        const existingDatetime = '2024-01-01T00:00:00Z'
        const existingState = {
            ...getOnboardingNotificationStateFixture(),
            trialRequestNotification: [
                {
                    userId: existingUserId,
                    receivedDatetime: existingDatetime,
                    trialType: TrialType.AiAgent,
                },
            ],
        }

        const result = getNotificationReceivedDatetimePayload(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiAgentTrialRequest,
                agent_id: newUserId,
            },
            existingState,
        )

        expect(result).toHaveProperty('trialRequestNotification')
        expect(result.trialRequestNotification).toHaveLength(2)
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'userId',
            existingUserId,
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'receivedDatetime',
            existingDatetime,
        )
        expect(result.trialRequestNotification?.[0]).toHaveProperty(
            'trialType',
            TrialType.AiAgent,
        )
        expect(result.trialRequestNotification?.[1]).toHaveProperty(
            'userId',
            newUserId,
        )
        expect(result.trialRequestNotification?.[1]).toHaveProperty(
            'receivedDatetime',
        )
        expect(result.trialRequestNotification?.[1]).toHaveProperty(
            'trialType',
            TrialType.AiAgent,
        )
    })

    it('should return an empty object for unsupported notification types', () => {
        const result = getNotificationReceivedDatetimePayload({
            ...basePayload,
            ai_agent_notification_type:
                'unsupported-series' as AiAgentNotificationType,
        })
        expect(result).toEqual({})
    })
})

describe('isNotificationAlreadyReceived', () => {
    const baseState: OnboardingNotificationState =
        getOnboardingNotificationStateFixture()

    it('should return false if onboardingNotificationState is undefined', () => {
        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.StartAiAgentSetup,
            },
            undefined,
        )
        expect(result).toBe(false)
    })

    it('should return false if notification has not been received', () => {
        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.StartAiAgentSetup,
            },
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
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.StartAiAgentSetup,
            },
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
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.FinishAiAgentSetup,
            },
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
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.ActivateAiAgent,
            },
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
            {
                ...basePayload,
                ai_agent_notification_type: AiAgentNotificationType.MeetAiAgent,
            },
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
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.FirstAiAgentTicket,
            },
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
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.ScrapingProcessingFinished,
            },
            state,
        )
        expect(result).toBe(true)
    })

    it('should return true for AiShoppingAssistantTrialRequest within 24 hours', () => {
        const userId = 123
        const twentyThreeHoursAgo = new Date(
            Date.now() - 23 * 60 * 60 * 1000,
        ).toISOString()
        const state = {
            ...baseState,
            trialRequestNotification: [
                { userId, receivedDatetime: twentyThreeHoursAgo },
            ],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(true)
    })

    it('should return false for AiShoppingAssistantTrialRequest older than 24 hours', () => {
        const userId = 123
        const twentyFiveHoursAgo = new Date(
            Date.now() - 25 * 60 * 60 * 1000,
        ).toISOString()
        const state = {
            ...baseState,
            trialRequestNotification: [
                { userId, receivedDatetime: twentyFiveHoursAgo },
            ],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(false)
    })

    it('should return false for AiShoppingAssistantTrialRequest when no trial request exists for user', () => {
        const userId = 123
        const otherUserId = 456
        const state = {
            ...baseState,
            trialRequestNotification: [
                {
                    userId: otherUserId,
                    receivedDatetime: new Date().toISOString(),
                },
            ],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(false)
    })

    it('should return false for AiShoppingAssistantTrialRequest when trialRequestNotification is empty', () => {
        const userId = 123
        const state = {
            ...baseState,
            trialRequestNotification: [],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(false)
    })

    it('should return true for AiAgentTrialRequest within 24 hours', () => {
        const userId = 123
        const twentyThreeHoursAgo = new Date(
            Date.now() - 23 * 60 * 60 * 1000,
        ).toISOString()
        const state = {
            ...baseState,
            trialRequestNotification: [
                {
                    userId,
                    receivedDatetime: twentyThreeHoursAgo,
                    trialType: TrialType.AiAgent,
                },
            ],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiAgentTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(true)
    })

    it('should return false for AiAgentTrialRequest older than 24 hours', () => {
        const userId = 123
        const twentyFiveHoursAgo = new Date(
            Date.now() - 25 * 60 * 60 * 1000,
        ).toISOString()
        const state = {
            ...baseState,
            trialRequestNotification: [
                {
                    userId,
                    receivedDatetime: twentyFiveHoursAgo,
                    trialType: TrialType.AiAgent,
                },
            ],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiAgentTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(false)
    })

    it('should return false for AiAgentTrialRequest when no trial request exists for user', () => {
        const userId = 123
        const otherUserId = 456
        const state = {
            ...baseState,
            trialRequestNotification: [
                {
                    userId: otherUserId,
                    receivedDatetime: new Date().toISOString(),
                    trialType: TrialType.AiAgent,
                },
            ],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiAgentTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(false)
    })

    it('should return false for AiAgentTrialRequest when trialRequestNotification is empty', () => {
        const userId = 123
        const state = {
            ...baseState,
            trialRequestNotification: [],
        }

        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.AiAgentTrialRequest,
                agent_id: userId,
            },
            state,
        )

        expect(result).toBe(false)
    })

    it('should return false for unsupported notification types', () => {
        const result = isNotificationAlreadyReceived(
            {
                ...basePayload,
                ai_agent_notification_type:
                    'unsupported-series' as AiAgentNotificationType,
            },
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

    it('should return correct received datetime for AiShoppingAssistantTrialRequest', () => {
        const userId = 123
        const receivedDatetime = '2024-01-01T00:00:00Z'
        const state = {
            ...baseState,
            trialRequestNotification: [{ userId, receivedDatetime }],
        }

        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            state,
            userId,
        )

        expect(result).toBe(receivedDatetime)
    })

    it('should return undefined when trial request notification does not exist for user', () => {
        const userId = 123
        const otherUserId = 456
        const receivedDatetime = '2024-01-01T00:00:00Z'
        const state = {
            ...baseState,
            trialRequestNotification: [
                { userId: otherUserId, receivedDatetime },
            ],
        }

        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            state,
            userId,
        )

        expect(result).toBeUndefined()
    })

    it('should return undefined when trialRequestNotification is null', () => {
        const userId = 123
        const state = baseState

        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            state,
            userId,
        )

        expect(result).toBeUndefined()
    })

    it('should return correct received datetime for AiAgentTrialRequest', () => {
        const userId = 123
        const receivedDatetime = '2024-01-01T00:00:00Z'
        const state = {
            ...baseState,
            trialRequestNotification: [
                { userId, receivedDatetime, trialType: TrialType.AiAgent },
            ],
        }

        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.AiAgentTrialRequest,
            state,
            userId,
        )

        expect(result).toBe(receivedDatetime)
    })

    it('should return undefined when AI Agent trial request notification does not exist for user', () => {
        const userId = 123
        const otherUserId = 456
        const receivedDatetime = '2024-01-01T00:00:00Z'
        const state = {
            ...baseState,
            trialRequestNotification: [
                {
                    userId: otherUserId,
                    receivedDatetime,
                    trialType: TrialType.AiAgent,
                },
            ],
        }

        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.AiAgentTrialRequest,
            state,
            userId,
        )

        expect(result).toBeUndefined()
    })

    it('should return undefined when trialRequestNotification is null', () => {
        const userId = 123
        const state = baseState

        const result = getNotificationReceivedDatetime(
            AiAgentNotificationType.AiAgentTrialRequest,
            state,
            userId,
        )

        expect(result).toBeUndefined()
    })

    it('should return null for unsupported notification types', () => {
        const result = getNotificationReceivedDatetime(
            'unsupported-series' as AiAgentNotificationType,
            baseState,
        )
        expect(result).toBe(null)
    })
})

it('should correctly determine if a datetime is less than 24 hours ago', () => {
    const now = new Date()

    // Test case 2: Date 23 hours ago (should return true)
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000)
    expect(isLessThan24HoursAgo(twentyThreeHoursAgo.toISOString())).toBe(true)

    // Test case 3: Date exactly 24 hours ago (should return false)
    const exactlyTwentyFourHoursAgo = new Date(
        now.getTime() - 24 * 60 * 60 * 1000,
    )
    expect(isLessThan24HoursAgo(exactlyTwentyFourHoursAgo.toISOString())).toBe(
        false,
    )

    // Test case 4: Date 25 hours ago (should return false)
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)
    expect(isLessThan24HoursAgo(twentyFiveHoursAgo.toISOString())).toBe(false)

    // Test case 5: Current time (should return true)
    expect(isLessThan24HoursAgo(now.toISOString())).toBe(true)

    // Test case 6: Invalid date string (should return false due to NaN calculation)
    expect(isLessThan24HoursAgo('invalid-date')).toBe(false)

    // Test case 7: Empty string (should return false)
    expect(isLessThan24HoursAgo('')).toBe(false)
})

describe('isTrialNotificationOfType', () => {
    it('should return true when trialType matches AiAgent', () => {
        const trialRequest = {
            userId: 123,
            receivedDatetime: '2024-01-01T00:00:00Z',
            trialType: TrialType.AiAgent,
        }

        const result = isTrialNotificationOfType(
            trialRequest,
            TrialType.AiAgent,
        )

        expect(result).toBe(true)
    })

    it('should return false when trialType does not match AiAgent', () => {
        const trialRequest = {
            userId: 123,
            receivedDatetime: '2024-01-01T00:00:00Z',
            trialType: TrialType.ShoppingAssistant,
        }

        const result = isTrialNotificationOfType(
            trialRequest,
            TrialType.AiAgent,
        )

        expect(result).toBe(false)
    })

    it('should return true when trialType matches ShoppingAssistant', () => {
        const trialRequest = {
            userId: 123,
            receivedDatetime: '2024-01-01T00:00:00Z',
            trialType: TrialType.ShoppingAssistant,
        }

        const result = isTrialNotificationOfType(
            trialRequest,
            TrialType.ShoppingAssistant,
        )

        expect(result).toBe(true)
    })

    it('should return false when trialType does not match ShoppingAssistant', () => {
        const trialRequest = {
            userId: 123,
            receivedDatetime: '2024-01-01T00:00:00Z',
            trialType: TrialType.AiAgent,
        }

        const result = isTrialNotificationOfType(
            trialRequest,
            TrialType.ShoppingAssistant,
        )

        expect(result).toBe(false)
    })

    it('should return true for ShoppingAssistant when trialType is undefined (legacy default)', () => {
        const trialRequest = {
            userId: 123,
            receivedDatetime: '2024-01-01T00:00:00Z',
        }

        const result = isTrialNotificationOfType(
            trialRequest,
            TrialType.ShoppingAssistant,
        )

        expect(result).toBe(true)
    })

    it('should return false for AiAgent when trialType is undefined (legacy default)', () => {
        const trialRequest = {
            userId: 123,
            receivedDatetime: '2024-01-01T00:00:00Z',
        }

        const result = isTrialNotificationOfType(
            trialRequest,
            TrialType.AiAgent,
        )

        expect(result).toBe(false)
    })
})
