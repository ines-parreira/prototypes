import { assumeMock } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { act, render } from '@testing-library/react'

import { WorkflowConfigurationUpdatedNotificationPayload } from 'automate/notifications/types'
import type { Notification } from 'common/notifications'
import { trackstarDefinitionKeys } from 'models/workflows/queries'

import WorkflowConfigurationUpdatedNotification from '../WorkflowConfigurationUpdatedNotification'

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

describe('WorkflowConfigurationUpdatedNotification', () => {
    const STORE_NAME = 'store_1'
    const INTEGRATION_NAME = 'Shopify'
    const invalidateQueriesMock = jest.fn()

    beforeEach(() => {
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should have correct URL in the content component', () => {
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
