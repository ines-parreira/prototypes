import { renderHook } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'

import { useDeleteTeam as useDeleteTeamPrimitive } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useDeleteTeam } from '../useDeleteTeam'

jest.mock('@gorgias/helpdesk-queries', () => ({
    __esModule: true,
    useDeleteTeam: jest.fn(),
    queryKeys: {
        teams: {
            listTeams: () => ({ pop: () => null }),
        },
    },
}))

const useDeleteTeamPrimitiveMock = assumeMock(useDeleteTeamPrimitive)
const mockMutateDeleteTeam = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useDeleteTeam', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useDeleteTeamPrimitiveMock.mockReturnValue({
            mutateAsync: mockMutateDeleteTeam,
        } as unknown as ReturnType<typeof useDeleteTeamPrimitive>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should handle settled request', () => {
        const onSettled = jest.fn()
        const { result } = renderHook(() => useDeleteTeam())

        void result.current.mutateAsync(
            {
                id: 111,
            },
            {
                onSettled,
            },
        )
        ;(
            useDeleteTeamPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSettled: () => void
            }
        )?.onSettled()

        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle failed request', () => {
        const msg = 'nope'
        const onError = jest.fn()
        const { result } = renderHook(() => useDeleteTeam())

        void result.current.mutateAsync(
            {
                id: 111,
            },
            {
                onError,
            },
        )
        ;(
            useDeleteTeamPrimitiveMock.mock.calls[0][0]
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
        const { result } = renderHook(() => useDeleteTeam())
        void result.current.mutateAsync(
            {
                id: 111,
            },
            {
                onSettled,
            },
        )
        ;(
            useDeleteTeamPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: (resp: unknown) => void
            }
        )?.onSuccess({
            data: {
                id,
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully deleted team',
            status: NotificationStatus.Success,
        })
    })
})
