import {ldClientMock} from 'jest-launchdarkly-mock'

import {getLDClient} from 'utils/launchDarkly'

import {AiAgentNotificationSeries} from '../types'
import {getNotificationParams} from '../utils'

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
            notification_series: AiAgentNotificationSeries.StartAiAgentSetup,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Set up AI Agent',
            subtitle:
                'We noticed you checking out AI Agent. It only takes a few steps to start automating 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent',
        })
    })

    it('should return correct params for FinishAiAgentSetup', () => {
        const payload = {
            ...basePayload,
            notification_series: AiAgentNotificationSeries.FinishAiAgentSetup,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Finish AI Agent setup',
            subtitle:
                'You’re only a few steps away from getting AI Agent ready to start automating 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent/new',
        })
    })

    it('should return correct params for ActivateAiAgent', () => {
        const payload = {
            ...basePayload,
            notification_series: AiAgentNotificationSeries.ActivateAiAgent,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Activate AI Agent',
            subtitle:
                'You’re just one click away from automating 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent',
        })
    })

    it('should return correct params for MeetAiAgent', () => {
        const payload = {
            ...basePayload,
            notification_series: AiAgentNotificationSeries.MeetAiAgent,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toEqual({
            title: 'Meet your newest team member: AI Agent',
            subtitle:
                'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent',
        })
    })

    it('should return correct params for FirstAiAgentTicket with valid ticket view ID', () => {
        const payload = {
            ...basePayload,
            notification_series: AiAgentNotificationSeries.FirstAiAgentTicket,
        }

        const result = getNotificationParams(payload, 123)

        expect(result).toEqual({
            title: 'AI Agent answered it’s first ticket',
            subtitle:
                'Review AI Agent’s response and leave feedback in the ticket to improve it’s performance.',
            redirectTo: '/app/views/123/12345',
        })
    })

    it('should return null for unsupported notification series', () => {
        const payload = {
            ...basePayload,
            notification_series:
                'unsupported-series' as AiAgentNotificationSeries,
        }

        const result = getNotificationParams(payload, null)

        expect(result).toBeNull()
    })
})
