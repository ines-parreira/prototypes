import { UserRealtimeAvailabilityUpdates } from '@repo/agent-status'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { CurrentUserRealtimeAvailabilityUpdates } from './CurrentUserRealtimeAvailabilityUpdates'

jest.mock('@repo/feature-flags')
jest.mock('hooks/useAppSelector')
jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    UserRealtimeAvailabilityUpdates: jest.fn(() => (
        <div data-testid="realtime-updates" />
    )),
}))

const useFlagMock = assumeMock(useFlag)
const useAppSelectorMock = assumeMock(useAppSelector)

describe('CurrentUserRealtimeAvailabilityUpdates', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(null)
    })

    it('should return null when feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(123)

        const { container } = render(<CurrentUserRealtimeAvailabilityUpdates />)

        expect(container.firstChild).toBeNull()
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.CustomAgentUnavailableStatuses,
        )
    })

    it('should return null when current user ID is not available', () => {
        useFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(null)

        const { container } = render(<CurrentUserRealtimeAvailabilityUpdates />)

        expect(container.firstChild).toBeNull()
        expect(useAppSelector).toHaveBeenCalledWith(getCurrentUserId)
    })

    it('should return null when current user ID is undefined', () => {
        useFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(undefined)

        const { container } = render(<CurrentUserRealtimeAvailabilityUpdates />)

        expect(container.firstChild).toBeNull()
    })

    it('should render UserRealtimeAvailabilityUpdates when feature flag is enabled and user ID exists', () => {
        useFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(456)

        const { getByTestId } = render(
            <CurrentUserRealtimeAvailabilityUpdates />,
        )

        expect(getByTestId('realtime-updates')).toBeInTheDocument()
        expect(UserRealtimeAvailabilityUpdates).toHaveBeenCalledWith(
            { userId: 456 },
            expect.anything(),
        )
    })
})
