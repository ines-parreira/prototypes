import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockGetUserAvailabilityResponse } from '@gorgias/helpdesk-mocks'

import { AgentAvatar } from '.'
import type { AgentAvatarProps } from '.'
import { CALL_WRAP_UP_STATUS, ON_A_CALL_STATUS } from '../../constants'
import * as hooks from '../../hooks'
import { render } from '../../tests/render.utils'

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual('@gorgias/axiom')
    return {
        ...actual,
        Avatar: vi.fn(({ name, status }) => (
            <div data-testid="mock-avatar">
                {name}
                {status}
            </div>
        )),
        AvatarStatusIndicator: vi.fn(({ color }) => (
            <div data-testid="status-indicator" data-color={color} />
        )),
    }
})

vi.mock('../../hooks', async () => {
    const actual = await vi.importActual<typeof hooks>('../../hooks')
    return {
        ...actual,
        useAgentPhoneStatus: vi.fn(),
        useUserAvailability: vi.fn(),
    }
})

// Test data constants
const defaultProps: AgentAvatarProps = {
    userId: 123,
    name: 'John Doe',
    url: 'https://example.com/avatar.jpg',
}

// Mock return value constants
const MOCK_PHONE_STATUS_NONE = {
    agentPhoneUnavailabilityStatus: undefined,
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
}

const MOCK_PHONE_STATUS_ON_CALL = {
    ...MOCK_PHONE_STATUS_NONE,
    agentPhoneUnavailabilityStatus: ON_A_CALL_STATUS,
} as const

const MOCK_PHONE_STATUS_WRAP_UP = {
    ...MOCK_PHONE_STATUS_NONE,
    agentPhoneUnavailabilityStatus: CALL_WRAP_UP_STATUS,
} as const

const MOCK_AVAILABILITY_NONE = {
    availability: undefined,
    activeStatusId: null,
    isLoading: false,
    isError: false,
    error: null,
} as ReturnType<typeof hooks.useUserAvailability>

const MOCK_AVAILABILITY_AVAILABLE = {
    availability: mockGetUserAvailabilityResponse({
        user_status: 'available',
    }),
    activeStatusId: 'available' as string | null,
    isLoading: false,
    isError: false,
    error: null,
} as ReturnType<typeof hooks.useUserAvailability>

const MOCK_AVAILABILITY_UNAVAILABLE = {
    availability: mockGetUserAvailabilityResponse({
        user_status: 'unavailable',
    }),
    activeStatusId: 'unavailable' as string | null,
    isLoading: false,
    isError: false,
    error: null,
} as ReturnType<typeof hooks.useUserAvailability>

const MOCK_AVAILABILITY_CUSTOM = {
    availability: mockGetUserAvailabilityResponse({
        user_status: 'custom',
        custom_user_availability_status_id: 'custom-id-123',
    }),
    activeStatusId: 'custom-id-123' as string | null,
    isLoading: false,
    isError: false,
    error: null,
} as ReturnType<typeof hooks.useUserAvailability>

// Helper functions
const renderAgentAvatar = (props?: Partial<AgentAvatarProps>) => {
    return render(<AgentAvatar {...defaultProps} {...props} />)
}

const mockPhoneStatus = (
    returnValue: ReturnType<typeof hooks.useAgentPhoneStatus>,
) => {
    vi.mocked(hooks.useAgentPhoneStatus).mockReturnValue(returnValue)
}

const mockAvailability = (
    returnValue: ReturnType<typeof hooks.useUserAvailability>,
) => {
    vi.mocked(hooks.useUserAvailability).mockReturnValue(returnValue)
}

describe('AgentAvatar', () => {
    let MockAvatar: ReturnType<typeof vi.fn>
    let MockAvatarStatusIndicator: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        vi.clearAllMocks()
        const axiom = await import('@gorgias/axiom')
        MockAvatar = vi.mocked(axiom.Avatar)
        MockAvatarStatusIndicator = vi.mocked(axiom.AvatarStatusIndicator)

        // Default mocks
        mockPhoneStatus(MOCK_PHONE_STATUS_NONE)
        mockAvailability(MOCK_AVAILABILITY_NONE)
    })

    describe('Avatar props', () => {
        it('should render avatar with correct name and url', () => {
            renderAgentAvatar()

            expect(MockAvatar).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'John Doe',
                    url: 'https://example.com/avatar.jpg',
                }),
                expect.anything(),
            )
        })

        it('should pass userId to hooks', () => {
            renderAgentAvatar({ userId: 456 })

            expect(hooks.useAgentPhoneStatus).toHaveBeenCalledWith({
                userId: 456,
            })
            expect(hooks.useUserAvailability).toHaveBeenCalledWith({
                userId: 456,
            })
        })
    })

    describe('Status indicator color - phone status priority', () => {
        it('should show red indicator when agent has phone unavailability status', () => {
            mockPhoneStatus(MOCK_PHONE_STATUS_ON_CALL)
            mockAvailability(MOCK_AVAILABILITY_AVAILABLE)

            renderAgentAvatar()

            expect(MockAvatarStatusIndicator).toHaveBeenCalledWith(
                expect.objectContaining({
                    color: 'red',
                }),
                expect.anything(),
            )
        })

        it('should prioritize phone status over availability status', () => {
            mockPhoneStatus(MOCK_PHONE_STATUS_WRAP_UP)
            mockAvailability(MOCK_AVAILABILITY_AVAILABLE)

            renderAgentAvatar()

            const indicator = screen.getByTestId('status-indicator')
            expect(indicator).toHaveAttribute('data-color', 'red')
        })
    })

    describe('Status indicator color - availability status', () => {
        beforeEach(() => {
            mockPhoneStatus(MOCK_PHONE_STATUS_NONE)
        })

        it('should show orange indicator when user is unavailable', () => {
            mockAvailability(MOCK_AVAILABILITY_UNAVAILABLE)

            renderAgentAvatar()

            expect(MockAvatarStatusIndicator).toHaveBeenCalledWith(
                expect.objectContaining({
                    color: 'orange',
                }),
                expect.anything(),
            )
        })

        it('should show green indicator when user is available', () => {
            mockAvailability(MOCK_AVAILABILITY_AVAILABLE)

            renderAgentAvatar()

            expect(MockAvatarStatusIndicator).toHaveBeenCalledWith(
                expect.objectContaining({
                    color: 'green',
                }),
                expect.anything(),
            )
        })

        it('should show orange indicator when user has custom status', () => {
            mockAvailability(MOCK_AVAILABILITY_CUSTOM)

            renderAgentAvatar()

            expect(MockAvatarStatusIndicator).toHaveBeenCalledWith(
                expect.objectContaining({
                    color: 'orange',
                }),
                expect.anything(),
            )
        })

        it('should not render status indicator when availability is undefined', () => {
            mockAvailability(MOCK_AVAILABILITY_NONE)

            renderAgentAvatar()

            expect(MockAvatarStatusIndicator).not.toHaveBeenCalled()
        })
    })

    describe('Status indicator rendering', () => {
        it('should render status indicator when color is computed', () => {
            mockAvailability(MOCK_AVAILABILITY_AVAILABLE)

            renderAgentAvatar()

            expect(screen.getByTestId('status-indicator')).toBeInTheDocument()
        })

        it('should not render status indicator when no status is available', () => {
            mockPhoneStatus(MOCK_PHONE_STATUS_NONE)
            mockAvailability(MOCK_AVAILABILITY_NONE)

            renderAgentAvatar()

            expect(
                screen.queryByTestId('status-indicator'),
            ).not.toBeInTheDocument()
        })
    })
})
