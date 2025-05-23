import { useGetTeam } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useFetchTeam } from '../useFetchTeam'

jest.mock('@gorgias/helpdesk-queries', () => ({
    __esModule: true,
    useGetTeam: jest.fn(),
}))

const useGetTeamMock = assumeMock(useGetTeam)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')

describe('useFetchTeam', () => {
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useGetTeamMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetTeam>)
    })

    it('should handle request', () => {
        const id = 1
        renderHook(() => useFetchTeam(id))

        expect(useGetTeamMock).toHaveBeenCalledWith(id)

        expect(notify).not.toHaveBeenCalled()
    })

    it('should handle failed request', () => {
        const id = 1
        const msg = 'nope'
        useGetTeamMock.mockReturnValue({
            error: {
                response: { data: { error: { msg } } },
            },
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useGetTeam>)

        renderHook(() => useFetchTeam(id))

        expect(notify).toHaveBeenNthCalledWith(1, {
            title: msg,
            allowHTML: true,
            message: null,
            status: NotificationStatus.Error,
        })
    })
})
