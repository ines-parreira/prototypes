import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent } from '@testing-library/react'

import type { AiAgentNotificationPayload } from 'automate/notifications/types'
import { AiAgentNotificationType } from 'automate/notifications/types'
import { getNotificationReceivedDatetimePayload } from 'automate/notifications/utils'
import type { Notification } from 'common/notifications'
import { defaultUseAiAgentOnboardingNotificationFixture } from 'fixtures/onboardingStateNotification'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { renderWithRouter } from 'utils/testing'

import AiAgentNotification from '../AiAgentNotification'

const TICKET_VIEW_ID = 123
const SHOP_NAME = 'store_1'

const mockOnRedirectToOpportunityPage = jest.fn()

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
        }) as typeof import('@repo/logging'),
)

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: jest.fn(() => ({
        aiAgentTicketViewId: TICKET_VIEW_ID,
    })),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')

jest.mock('pages/aiAgent/opportunities/hooks/useOpportunitiesTracking', () => ({
    useOpportunitiesTracking: jest.fn(() => ({
        onRedirectToOpportunityPage: mockOnRedirectToOpportunityPage,
        onOpportunityPageVisited: jest.fn(),
        onOpportunityViewed: jest.fn(),
        onOpportunityAccepted: jest.fn(),
        onOpportunityDismissed: jest.fn(),
    })),
}))

const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)

const defaultUseAiAgentOnboardingNotification =
    defaultUseAiAgentOnboardingNotificationFixture({
        shopName: SHOP_NAME,
    })

describe('AiAgentNotification', () => {
    const mockDatetime = '2024-11-04T13:07:00'
    beforeEach(() => {
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        jest.useFakeTimers().setSystemTime(new Date(mockDatetime))
    })

    const basePayload = {
        shop_name: SHOP_NAME,
        shop_type: 'shopify',
    } as const

    const notifications: {
        type: AiAgentNotificationType
        payload: AiAgentNotificationPayload
        title: string
        subtitle: string
        redirectTo: string
    }[] = [
        {
            type: AiAgentNotificationType.StartAiAgentSetup,
            payload: {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.StartAiAgentSetup,
            },
            title: 'Set up AI Agent',
            subtitle:
                'We noticed you checking out AI Agent. It only takes a few steps to start automating 60% of your tickets!',
            redirectTo: '/app/ai-agent/shopify/store_1',
        },
        {
            type: AiAgentNotificationType.FinishAiAgentSetup,
            payload: {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.FinishAiAgentSetup,
            },
            title: 'Finish AI Agent setup',
            subtitle:
                "You're only a few steps away from getting AI Agent ready to start automating 60% of your tickets!",
            redirectTo: '/app/ai-agent/shopify/store_1/onboarding',
        },
        {
            type: AiAgentNotificationType.ActivateAiAgent,
            payload: {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.ActivateAiAgent,
            },
            title: 'Activate AI Agent',
            subtitle:
                "You're just one click away from automating 60% of your tickets!",
            redirectTo: '/app/ai-agent/shopify/store_1/settings',
        },
        {
            type: AiAgentNotificationType.MeetAiAgent,
            payload: {
                ...basePayload,
                ai_agent_notification_type: AiAgentNotificationType.MeetAiAgent,
            },
            title: 'Meet your new team member: AI Agent',
            subtitle:
                'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
            redirectTo: '/app/ai-agent/shopify/store_1',
        },
        {
            type: AiAgentNotificationType.FirstAiAgentTicket,
            payload: {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.FirstAiAgentTicket,
                ticket_id: '12345',
            },
            title: 'AI Agent answered its first ticket',
            subtitle:
                "Review AI Agent's response and leave feedback in the ticket to improve its performance.",
            redirectTo: `/app/views/${TICKET_VIEW_ID}/12345`,
        },
    ]

    it.each(notifications)(
        'should render correctly $type notification and redirect to the correct page when clicked',
        ({ payload, title, subtitle, redirectTo }) => {
            const notification: Notification<AiAgentNotificationPayload> = {
                id: '1',
                inserted_datetime: '2024-11-04T13:07:00',
                read_datetime: null,
                seen_datetime: null,
                type: 'automate-setup-and-optimization',
                payload,
            }

            const { getByText, container } = renderWithRouter(
                <AiAgentNotification notification={notification} />,
            )

            const titleElement = getByText(title)
            expect(titleElement).toBeInTheDocument()

            const subtitleElement = getByText(subtitle)
            expect(subtitleElement).toBeInTheDocument()

            const linkElement = container.querySelector(
                `a[href="${redirectTo}"]`,
            )
            expect(linkElement).toBeInTheDocument()

            fireEvent.click(linkElement as HTMLElement)
        },
    )

    it('should not render if the notification type is not supported', () => {
        const unsupportedNotification: Notification<AiAgentNotificationPayload> =
            {
                id: '2',
                inserted_datetime: '2024-11-04T13:07:00',
                read_datetime: null,
                seen_datetime: null,
                type: 'automate-setup-and-optimization',
                payload: {
                    ...basePayload,
                    ai_agent_notification_type: 'unsupported-type',
                } as unknown as AiAgentNotificationPayload,
            }

        const { container } = renderWithRouter(
            <AiAgentNotification notification={unsupportedNotification} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it.each(notifications)(
        'should save and log event when $type notification is received',
        ({ type, payload }) => {
            const notification: Notification<AiAgentNotificationPayload> = {
                id: '1',
                inserted_datetime: '2024-11-04T13:07:00',
                read_datetime: null,
                seen_datetime: null,
                type: 'automate-setup-and-optimization',
                payload,
            }

            renderWithRouter(
                <AiAgentNotification notification={notification} />,
            )

            expect(
                defaultUseAiAgentOnboardingNotification.handleOnSave,
            ).toHaveBeenCalledWith(
                getNotificationReceivedDatetimePayload(notification.payload),
            )

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentOnboardingNotificationReceived,
                {
                    type,
                },
            )
        },
    )

    it('should not save and log event when NewOpportunityGenerated notification is received', () => {
        const notification: Notification<AiAgentNotificationPayload> = {
            id: '1',
            inserted_datetime: '2024-11-04T13:07:00',
            read_datetime: null,
            seen_datetime: null,
            type: 'automate-setup-and-optimization',
            payload: {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.NewOpportunityGenerated,
                opportunity_ids: [123],
                total_tickets: 4,
            },
        }

        renderWithRouter(<AiAgentNotification notification={notification} />)

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).not.toHaveBeenCalled()

        expect(logEvent).not.toHaveBeenCalled()
    })

    it.each(notifications)(
        'should log event when $type notification is clicked',
        ({ type, payload, redirectTo }) => {
            const notification: Notification<AiAgentNotificationPayload> = {
                id: '1',
                inserted_datetime: '2024-11-04T13:07:00',
                read_datetime: null,
                seen_datetime: null,
                type: 'automate-setup-and-optimization',
                payload,
            }

            const { container } = renderWithRouter(
                <AiAgentNotification notification={notification} />,
            )

            const linkElement = container.querySelector(
                `a[href="${redirectTo}"]`,
            )
            expect(linkElement).toBeInTheDocument()

            fireEvent.click(linkElement as HTMLElement)

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentOnboardingNotificationClicked,
                {
                    type,
                },
            )
        },
    )

    it('should call onClick from props when the notification is clicked', () => {
        const mockOnClick = jest.fn()

        const notification: Notification<AiAgentNotificationPayload> = {
            id: '2',
            inserted_datetime: '2024-11-04T13:07:00',
            read_datetime: null,
            seen_datetime: null,
            type: 'automate-setup-and-optimization',
            payload: {
                ...basePayload,
                ai_agent_notification_type: AiAgentNotificationType.MeetAiAgent,
            },
        }

        const { container } = renderWithRouter(
            <AiAgentNotification
                notification={notification}
                onClick={mockOnClick}
            />,
        )

        const linkElement = container.querySelector('a')
        expect(linkElement).toBeInTheDocument()

        fireEvent.click(linkElement as HTMLElement)

        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should track redirect to opportunity page when NewOpportunityGenerated notification is clicked', () => {
        const notification: Notification<AiAgentNotificationPayload> = {
            id: '3',
            inserted_datetime: '2024-11-04T13:07:00',
            read_datetime: null,
            seen_datetime: null,
            type: 'automate-setup-and-optimization',
            payload: {
                ...basePayload,
                ai_agent_notification_type:
                    AiAgentNotificationType.NewOpportunityGenerated,
                opportunity_ids: [123],
                total_tickets: 4,
            },
        }

        const { container } = renderWithRouter(
            <AiAgentNotification notification={notification} />,
        )

        const linkElement = container.querySelector('a')
        expect(linkElement).toBeInTheDocument()

        fireEvent.click(linkElement as HTMLElement)

        expect(mockOnRedirectToOpportunityPage).toHaveBeenCalledWith({
            referrer: 'in-app-notification',
        })
    })
})
