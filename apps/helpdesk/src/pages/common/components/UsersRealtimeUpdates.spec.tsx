import { assumeMock, render } from '@repo/testing'
import { useUsersRealtimeUpdates } from '@repo/users'

import { UsersRealtimeUpdates } from './UsersRealtimeUpdates'

jest.mock('@repo/users', () => ({
    useUsersRealtimeUpdates: jest.fn(),
}))

const useUsersRealtimeUpdatesMock = assumeMock(useUsersRealtimeUpdates)

beforeEach(() => {
    jest.clearAllMocks()
})

describe('UsersRealtimeUpdates', () => {
    it('mounts the account-channel realtime updates hook', () => {
        render(<UsersRealtimeUpdates />)

        expect(useUsersRealtimeUpdatesMock).toHaveBeenCalled()
    })
})
