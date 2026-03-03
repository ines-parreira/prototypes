import {
    useCustomAgentUnavailableStatusesFlag,
    UserRealtimeAvailabilityUpdates,
} from '@repo/agent-status'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { CurrentUserRealtimeAvailabilityUpdates } from './CurrentUserRealtimeAvailabilityUpdates'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    UserRealtimeAvailabilityUpdates: jest.fn(() => (
        <div data-testid="realtime-updates" />
    )),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

const useCustomAgentUnavailableStatusesFlagMock = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)
const useAppSelectorMock = assumeMock(useAppSelector)

describe('CurrentUserRealtimeAvailabilityUpdates', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(null)
    })

    it('should return null when feature flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(123)

        const { container } = render(<CurrentUserRealtimeAvailabilityUpdates />)

        expect(container.firstChild).toBeNull()
        expect(useCustomAgentUnavailableStatusesFlag).toHaveBeenCalled()
    })

    it('should return null when current user ID is not available', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(null)

        const { container } = render(<CurrentUserRealtimeAvailabilityUpdates />)

        expect(container.firstChild).toBeNull()
        expect(useAppSelector).toHaveBeenCalledWith(getCurrentUserId)
    })

    it('should return null when current user ID is undefined', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(undefined)

        const { container } = render(<CurrentUserRealtimeAvailabilityUpdates />)

        expect(container.firstChild).toBeNull()
    })

    it('should render UserRealtimeAvailabilityUpdates when feature flag is enabled and user ID exists', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
