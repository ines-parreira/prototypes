import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import { useUpdateTeam as useUpdateTeamPrimitive } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useUpdateTeam } from '../useUpdateTeam'

jest.mock('@gorgias/helpdesk-queries', () => ({
    __esModule: true,
    useUpdateTeam: jest.fn(),
    queryKeys: {
        teams: {
            getTeam: jest.fn(),
        },
    },
}))

const useUpdateTeamPrimitiveMock = assumeMock(useUpdateTeamPrimitive)
const mockMutateUpdateTeam = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useUpdateTeam', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useUpdateTeamPrimitiveMock.mockReturnValue({
            mutate: mockMutateUpdateTeam,
        } as unknown as ReturnType<typeof useUpdateTeamPrimitive>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should handle settled request', () => {
        const onSettled = jest.fn()
        const { result } = renderHook(() => useUpdateTeam(1))

        void result.current.mutate(
            {
                id: 111,
                data: {},
            },
            {
                onSettled,
            },
        )
        ;(
            useUpdateTeamPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSettled: () => void
            }
        )?.onSettled()

        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle failed request', () => {
        const msg = 'nope'
        const onError = jest.fn()
        const { result } = renderHook(() => useUpdateTeam(1))

        void result.current.mutate(
            {
                id: 111,
                data: {},
            },
            {
                onError,
            },
        )
        ;(
            useUpdateTeamPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onError: (args: unknown) => void
            }
        )?.onError({
            response: {
                data: {
                    error: {
                        msg,
                    },
                },
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            title: msg,
            allowHTML: true,
            message: null,
            status: NotificationStatus.Error,
        })
    })

    it('should handle successful request', () => {
        const id = 111
        const onSettled = jest.fn()
        const { result } = renderHook(() => useUpdateTeam(1))
        void result.current.mutate(
            {
                id: 111,
                data: {},
            },
            {
                onSettled,
            },
        )
        ;(
            useUpdateTeamPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: (resp: unknown) => void
            }
        )?.onSuccess({
            data: {
                id,
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully updated team',
            status: NotificationStatus.Success,
        })
    })
})
