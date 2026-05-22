import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import type { WorkflowConfigurationUpdatedNotificationPayload } from 'automate/notifications/types'
import type { Notification } from 'common/notifications'
import { trackstarDefinitionKeys } from 'models/workflows/queries'

import WorkflowConfigurationUpdatedNotification from '../WorkflowConfigurationUpdatedNotification'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))
jest.mock('@knocklabs/react', () => ({
    useKnockFeed: jest.fn(),
    useKnockClient: jest.fn(),
    FilterStatus: {
        All: 'all',
        Read: 'read',
        Unseen: 'unseen',
        Unread: 'unread',
    },
    NotificationFeed: () => null,
    KnockFeedProvider: ({ children }: { children: ReactNode }) => children,
    KnockProvider: ({ children }: { children: ReactNode }) => children,
}))

const useQueryClientMock = assumeMock(useQueryClient)
const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
const useKnockFeedMock = assumeMock(useKnockFeed)

const STORE_NAME = 'store_1'
const INTEGRATION_NAME = 'Shopify'

const notification: Notification<WorkflowConfigurationUpdatedNotificationPayload> =
    {
        id: '1',
        inserted_datetime: '2024-11-04T13:07:00',
        read_datetime: null,
        seen_datetime: null,
        type: 'workflow-configuration.updated',
        payload: {
            store_type: 'shopify',
            type: 'trackstar-disconnected',
            store_name: STORE_NAME,
            integration_name: INTEGRATION_NAME,
        },
    }

describe('WorkflowConfigurationUpdatedNotification', () => {
    const invalidateQueriesMock = jest.fn()

    beforeEach(() => {
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead: jest.fn(), markAsUnread: jest.fn() },
            useFeedStore: (selector: (state: { items: [] }) => unknown) =>
                selector({ items: [] }),
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should have correct URL in the content component', () => {
            const { container } = render(
                <WorkflowConfigurationUpdatedNotification
                    notification={notification}
                />,
            )

            const linkElement = container.querySelector('a')
            expect(linkElement).toBeInTheDocument()

            act(() => {
                linkElement?.click()
            })
            expect(invalidateQueriesMock).toHaveBeenCalledWith({
                queryKey: trackstarDefinitionKeys.all(),
            })
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render the reconnect title', () => {
            const { getByText } = render(
                <WorkflowConfigurationUpdatedNotification
                    notification={notification}
                />,
            )
            expect(
                getByText(`Reconnect ${INTEGRATION_NAME}`),
            ).toBeInTheDocument()
        })

        it('should render the reconnect body text', () => {
            const { container } = render(
                <WorkflowConfigurationUpdatedNotification
                    notification={notification}
                />,
            )
            expect(container.textContent).toContain(
                `Your connection with ${INTEGRATION_NAME} has been interrupted`,
            )
        })

        it('should link to the AI agent actions route', () => {
            const { container } = render(
                <WorkflowConfigurationUpdatedNotification
                    notification={notification}
                />,
            )
            expect(container.querySelector('a')).toBeInTheDocument()
        })

        it('should call invalidateQueries when clicked', () => {
            const { container } = render(
                <WorkflowConfigurationUpdatedNotification
                    notification={notification}
                />,
            )

            act(() => {
                container.querySelector('a')?.click()
            })

            expect(invalidateQueriesMock).toHaveBeenCalledWith({
                queryKey: trackstarDefinitionKeys.all(),
            })
        })

        it('should render the warning-triangle icon', () => {
            const { getByRole } = render(
                <WorkflowConfigurationUpdatedNotification
                    notification={notification}
                />,
            )
            expect(
                getByRole('img', { name: 'warning-triangle' }),
            ).toBeInTheDocument()
        })
    })
})
