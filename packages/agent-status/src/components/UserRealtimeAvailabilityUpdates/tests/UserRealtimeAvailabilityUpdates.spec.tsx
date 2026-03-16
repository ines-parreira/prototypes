import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAccountId, useChannel } from '@gorgias/realtime'

import { useUserAvailabilityRealtimeHandler } from '../../../hooks/useUserAvailabilityRealtimeHandler'
import { UserRealtimeAvailabilityUpdates } from '../UserRealtimeAvailabilityUpdates'

vi.mock('@gorgias/realtime', () => ({
    useAccountId: vi.fn(),
    useChannel: vi.fn(),
}))

vi.mock('../../../hooks/useUserAvailabilityRealtimeHandler', () => ({
    useUserAvailabilityRealtimeHandler: vi.fn(),
}))

const mockUseAccountId = useAccountId as ReturnType<typeof vi.fn>
const mockUseChannel = useChannel as ReturnType<typeof vi.fn>
const mockUseUserAvailabilityRealtimeHandler =
    useUserAvailabilityRealtimeHandler as ReturnType<typeof vi.fn>

describe('UserRealtimeAvailabilityUpdates', () => {
    const mockUserId = 123
    const mockAccountId = 456
    const mockOnEvent = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAccountId.mockReturnValue(mockAccountId)
        mockUseUserAvailabilityRealtimeHandler.mockReturnValue(mockOnEvent)
    })

    it('should subscribe to user-specific channel', () => {
        render(<UserRealtimeAvailabilityUpdates userId={mockUserId} />)

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: {
                name: 'user',
                accountId: mockAccountId,
                userId: mockUserId,
            },
            onEvent: mockOnEvent,
        })
    })

    it('should call useUserAvailabilityRealtimeHandler', () => {
        render(<UserRealtimeAvailabilityUpdates userId={mockUserId} />)

        expect(mockUseUserAvailabilityRealtimeHandler).toHaveBeenCalled()
    })

    it('should render nothing', () => {
        const { container } = render(
            <UserRealtimeAvailabilityUpdates userId={mockUserId} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle undefined accountId', () => {
        mockUseAccountId.mockReturnValue(undefined)

        render(<UserRealtimeAvailabilityUpdates userId={mockUserId} />)

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: undefined,
            onEvent: mockOnEvent,
        })
    })
})
