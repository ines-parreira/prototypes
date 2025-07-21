import { useNotify } from 'hooks/useNotify'
import { IntegrationType } from 'models/integration/constants'
import {
    EmailIntegration,
    GorgiasChatIntegration,
} from 'models/integration/types'
import { renderHook } from 'utils/testing/renderHook'

import { ChannelChange, ChannelWithMetadata } from '../../../../types'
import { useNotifications } from '../useNotifications'

jest.mock('hooks/useNotify')

const mockSuccess = jest.fn()
const mockError = jest.fn()
const mockWarning = jest.fn()

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
        ;(useNotify as jest.Mock).mockReturnValue({
            success: mockSuccess,
            error: mockError,
            warning: mockWarning,
        })
    })

    it('should show success message when there are no errors', () => {
        const { result } = renderHook(() => useNotifications(mockChannels))

        const changes: ChannelChange[] = [{ channelId: 1, action: 'add' }]
        result.current.handleMappingResults([], changes)

        expect(mockSuccess).toHaveBeenCalledWith(
            'Changes are saved to this store.',
        )
        expect(mockError).not.toHaveBeenCalled()
    })

    it('should show error message when all changes fail', () => {
        const { result } = renderHook(() => useNotifications(mockChannels))
        const changes: ChannelChange[] = [{ channelId: 1, action: 'add' }]
        const errors = [{ channelId: 1 }]

        result.current.handleMappingResults(errors, changes)

        expect(mockError).toHaveBeenCalledWith(
            'We couldn’t save your changes. Please try again.',
        )
        expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('should show specific error message for partial failures', () => {
        const { result } = renderHook(() => useNotifications(mockChannels))
        const changes: ChannelChange[] = [
            { channelId: 1, action: 'add' },
            { channelId: 2, action: 'add' },
        ]
        const errors = [{ channelId: 1 }]

        result.current.handleMappingResults(errors, changes)

        expect(mockWarning).toHaveBeenCalledWith(
            'Most integrations were updated, except for: Integration 1. Check your settings and try again.',
        )
        expect(mockSuccess).not.toHaveBeenCalled()
    })
})
