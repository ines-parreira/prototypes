import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'
import type {
    EmailIntegration,
    GorgiasChatIntegration,
} from 'models/integration/types'

import type { ChannelChange, ChannelWithMetadata } from '../../../../types'
import { useNotifications } from '../useNotifications'

const mockEmailIntegration: EmailIntegration = {
    id: 1,
    name: 'Integration 1',
    type: IntegrationType.Email,
    meta: {
        address: 'test@example.com',
    },
} as EmailIntegration

const mockChatIntegration: GorgiasChatIntegration = {
    id: 2,
    name: 'Integration 2',
    type: IntegrationType.GorgiasChat,
    meta: {
        language: 'en',
    },
} as GorgiasChatIntegration

const mockChannels: ChannelWithMetadata[] = [
    {
        title: 'Channel 1',
        description: 'Description 1',
        count: 1,
        type: 'email',
        assignedChannels: [mockEmailIntegration],
        unassignedChannels: [],
    },
    {
        title: 'Channel 2',
        description: 'Description 2',
        count: 1,
        type: 'chat',
        assignedChannels: [mockChatIntegration],
        unassignedChannels: [],
    },
]

describe('useNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show success message when there are no errors', async () => {
        const { result } = renderHook(() => useNotifications(mockChannels))

        const changes: ChannelChange[] = [{ channelId: 1, action: 'add' }]
        result.current.handleMappingResults([], changes)

        const toastEl = await screen.findByRole('status', {
            name: 'Changes are saved to this store.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should show error message when all changes fail', async () => {
        const { result } = renderHook(() => useNotifications(mockChannels))
        const changes: ChannelChange[] = [{ channelId: 1, action: 'add' }]
        const errors = [{ channelId: 1 }]

        result.current.handleMappingResults(errors, changes)

        const toastEl = await screen.findByRole('status', {
            name: 'We couldn’t save your changes. Please try again.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('should show specific error message for partial failures', async () => {
        const { result } = renderHook(() => useNotifications(mockChannels))
        const changes: ChannelChange[] = [
            { channelId: 1, action: 'add' },
            { channelId: 2, action: 'add' },
        ]
        const errors = [{ channelId: 1 }]

        result.current.handleMappingResults(errors, changes)

        const toastEl = await screen.findByRole('status', {
            name: 'Most integrations were updated, except for: Integration 1. Check your settings and try again.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'warning')
    })
})
