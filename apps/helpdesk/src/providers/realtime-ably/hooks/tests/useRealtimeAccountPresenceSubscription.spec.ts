import { assumeMock, renderHook } from '@repo/testing'

import { useRealtimeAccountSubscription } from '@gorgias/realtime'

import { INITIAL_ACCOUNT_CONNECTION_PRESENCE_DATA } from '../constants'
import { useAccountConnectionActivity } from '../useAccountConnectionActivity'
import { useRealtimeAccountPresenceSubscription } from '../useRealtimeAccountPresenceSubscription'

jest.mock('@gorgias/realtime', () => ({
    useRealtimeAccountSubscription: jest.fn(),
}))

jest.mock('../useAccountConnectionActivity', () => ({
    ...jest.requireActual('../useAccountConnectionActivity'),
    useAccountConnectionActivity: jest.fn(),
}))

const useRealtimeAccountSubscriptionMock = assumeMock(
    useRealtimeAccountSubscription,
)
const useAccountConnectionActivityMock = assumeMock(
    useAccountConnectionActivity,
)
const updatePresenceDataMock = jest.fn()

describe('useRealtimeAccountPresenceSubscription', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useRealtimeAccountSubscriptionMock.mockReturnValue({
            updatePresenceData: updatePresenceDataMock,
        })
    })

    it('enters account presence with initial connection data and wires the updater to account connection activity', () => {
        renderHook(() => useRealtimeAccountPresenceSubscription())

        expect(useRealtimeAccountSubscriptionMock).toHaveBeenCalledWith({
            initialPresenceData: INITIAL_ACCOUNT_CONNECTION_PRESENCE_DATA,
        })
        expect(useAccountConnectionActivityMock).toHaveBeenCalledWith(
            updatePresenceDataMock,
        )
    })
})
