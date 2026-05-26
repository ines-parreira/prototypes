import {
    useCustomAgentUnavailableStatusesFlag,
    UserRealtimeAvailabilityUpdates,
} from '@repo/agent-status'
import { assumeMock, render } from '@repo/testing'
import { useUserAvailabilityRealtimeUpdates } from '@repo/users'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserAvailabilityRealtimeUpdates } from './UserAvailabilityRealtimeUpdates'

jest.mock('@repo/users', () => ({
    useUserAvailabilityRealtimeUpdates: jest.fn(),
}))

jest.mock('@repo/agent-status', () => ({
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
    UserRealtimeAvailabilityUpdates: jest.fn(() => (
        <div>UserRealtimeAvailabilityUpdates</div>
    )),
}))

const useUserAvailabilityRealtimeUpdatesMock = assumeMock(
    useUserAvailabilityRealtimeUpdates,
)
const useCustomAgentUnavailableStatusesFlagMock = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)
const UserRealtimeAvailabilityUpdatesMock = assumeMock(
    UserRealtimeAvailabilityUpdates,
)

beforeEach(() => {
    jest.clearAllMocks()
})

describe('UserAvailabilityRealtimeUpdates', () => {
    it('always mounts the account-channel realtime updates hook', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        render(<UserAvailabilityRealtimeUpdates />, {
            storeState: { currentUser: fromJS({ id: 20 }) },
        })

        expect(useUserAvailabilityRealtimeUpdatesMock).toHaveBeenCalled()
    })

    it('also mounts the legacy per-user subscription for the current user when the FF is on', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

        render(<UserAvailabilityRealtimeUpdates />, {
            storeState: { currentUser: fromJS({ id: 20 }) },
        })

        expect(
            screen.getByText('UserRealtimeAvailabilityUpdates'),
        ).toBeInTheDocument()
        expect(UserRealtimeAvailabilityUpdatesMock).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 20 }),
            expect.anything(),
        )
    })

    it('skips the legacy subscription when the FF is off', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        render(<UserAvailabilityRealtimeUpdates />, {
            storeState: { currentUser: fromJS({ id: 20 }) },
        })

        expect(
            screen.queryByText('UserRealtimeAvailabilityUpdates'),
        ).not.toBeInTheDocument()
    })

    it('skips the legacy subscription when there is no current user', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

        render(<UserAvailabilityRealtimeUpdates />)

        expect(
            screen.queryByText('UserRealtimeAvailabilityUpdates'),
        ).not.toBeInTheDocument()
    })
})
