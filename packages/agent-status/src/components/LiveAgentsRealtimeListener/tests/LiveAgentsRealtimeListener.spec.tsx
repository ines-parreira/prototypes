import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAccountId, useChannels } from '@gorgias/realtime'

import { useUserAvailabilityRealtimeHandler } from '../../../hooks/useUserAvailabilityRealtimeHandler'
import { LiveAgentsRealtimeListener } from '../LiveAgentsRealtimeListener'

vi.mock('@gorgias/realtime', () => ({
    useAccountId: vi.fn(),
    useChannels: vi.fn(),
}))

vi.mock('../../../hooks/useUserAvailabilityRealtimeHandler', () => ({
    useUserAvailabilityRealtimeHandler: vi.fn(),
}))

const mockUseAccountId = useAccountId as ReturnType<typeof vi.fn>
const mockUseChannels = useChannels as ReturnType<typeof vi.fn>
const mockUseUserAvailabilityRealtimeHandler =
    useUserAvailabilityRealtimeHandler as ReturnType<typeof vi.fn>

describe('LiveAgentsRealtimeListener', () => {
    const mockUserIds = [123, 456, 789]
    const mockAccountId = 999
    const mockOnEvent = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAccountId.mockReturnValue(mockAccountId)
        mockUseUserAvailabilityRealtimeHandler.mockReturnValue(mockOnEvent)
    })

    it('should subscribe to multiple user-specific channels', () => {
        render(<LiveAgentsRealtimeListener userIds={mockUserIds} />)

        expect(mockUseChannels).toHaveBeenCalledWith({
            channels: mockUserIds.map((userId) => ({
                name: 'user',
                accountId: mockAccountId,
                userId,
            })),
            onEvent: mockOnEvent,
        })
    })

    it('should render nothing', () => {
        const { container } = render(
            <LiveAgentsRealtimeListener userIds={mockUserIds} />,
        )

        expect(container.firstChild).toBeNull()
    })
})
