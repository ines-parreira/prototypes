import {render, fireEvent} from '@testing-library/react'
import {ldClientMock} from 'jest-launchdarkly-mock'
import React from 'react'

import {
    AiAgentNotificationPayload,
    AiAgentNotificationSeries,
} from 'automate/notifications/types'
import type {Notification} from 'common/notifications'

import {getLDClient} from 'utils/launchDarkly'

import AiAgentNotification from '../AiAgentNotification'

const mockAiAgentTicketViewId = 123

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: jest.fn(() => ({
        aiAgentTicketViewId: mockAiAgentTicketViewId,
    })),
}))

describe('AiAgentNotification', () => {
    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    const basePayload = {
        shop_name: 'store_1',
        shop_type: 'shopify',
    }

    const notifications: {
        series: AiAgentNotificationSeries
        title: string
        subtitle: string
        redirectTo: string
    }[] = [
        {
            series: AiAgentNotificationSeries.StartAiAgentSetup,
            title: 'Set up AI Agent',
            subtitle:
                'We noticed you checking out AI Agent. It only takes a few steps to start automating 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent',
        },
        {
            series: AiAgentNotificationSeries.FinishAiAgentSetup,
            title: 'Finish AI Agent setup',
            subtitle:
                'You’re only a few steps away from getting AI Agent ready to start automating 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent/new',
        },
        {
            series: AiAgentNotificationSeries.ActivateAiAgent,
            title: 'Activate AI Agent',
            subtitle:
                'You’re just one click away from automating 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent',
        },
        {
            series: AiAgentNotificationSeries.MeetAiAgent,
            title: 'Meet your newest team member: AI Agent',
            subtitle:
                'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
            redirectTo: '/app/automation/shopify/store_1/ai-agent',
        },
        {
            series: AiAgentNotificationSeries.FirstAiAgentTicket,
            title: 'AI Agent answered it’s first ticket',
            subtitle:
                'Review AI Agent’s response and leave feedback in the ticket to improve it’s performance.',
            redirectTo: `/app/views/${mockAiAgentTicketViewId}/12345`,
        },
    ]

    it.each(notifications)(
        'should render correctly $series notification and redirect to the correct page when clicked',
        ({series, title, subtitle, redirectTo}) => {
            const notification: Notification<AiAgentNotificationPayload> = {
                id: '1',
                inserted_datetime: '2024-11-04T13:07:00',
                read_datetime: null,
                seen_datetime: null,
                type: 'automate-setup-and-optimization',
                payload: {
                    ...basePayload,
                    notification_series: series,
                    ticket_id:
                        series === AiAgentNotificationSeries.FirstAiAgentTicket
                            ? '12345'
                            : undefined,
                },
            }

            const {getByText, container} = render(
                <AiAgentNotification notification={notification} />
            )

            const titleElement = getByText(title)
            expect(titleElement).toBeInTheDocument()

            const subtitleElement = getByText(subtitle)
            expect(subtitleElement).toBeInTheDocument()

            const linkElement = container.querySelector(`a[to="${redirectTo}"]`)
            expect(linkElement).toBeInTheDocument()

            fireEvent.click(linkElement as HTMLElement)
        }
    )

    it('should not render if the notification series is not supported', () => {
        const unsupportedNotification: Notification<AiAgentNotificationPayload> =
            {
                id: '2',
                inserted_datetime: '2024-11-04T13:07:00',
                read_datetime: null,
                seen_datetime: null,
                type: 'automate-setup-and-optimization',
                payload: {
                    ...basePayload,
                    notification_series:
                        'unsupported-series' as AiAgentNotificationSeries,
                },
            }

        const {container} = render(
            <AiAgentNotification notification={unsupportedNotification} />
        )

        expect(container).toBeEmptyDOMElement()
    })
})
