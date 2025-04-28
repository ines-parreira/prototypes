import { QueryClient, useQueryClient } from '@tanstack/react-query'

import { useDeleteMacro as useDeleteMacroPrimitive } from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useDeleteMacro } from '../useDeleteMacro'

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
    useDeleteMacro: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({ pop: () => null }),
        },
    },
}))

const useDeleteMacroPrimitiveMock = assumeMock(useDeleteMacroPrimitive)
const mockMutateDeleteMacro = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useDeleteMacro', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useDeleteMacroPrimitiveMock.mockReturnValue({
            mutateAsync: mockMutateDeleteMacro,
        } as unknown as ReturnType<typeof useDeleteMacroPrimitive>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should handle settled request', () => {
        const onSettled = jest.fn()
        const { result } = renderHook(() => useDeleteMacro())

        void result.current.mutateAsync(
            {
                id: 111,
            },
            {
                onSettled,
            },
        )
        ;(
            useDeleteMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSettled: () => void
            }
        )?.onSettled()

        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle failed request', () => {
        const msg = 'nope'
        const onError = jest.fn()
        const { result } = renderHook(() => useDeleteMacro())

        void result.current.mutateAsync(
            {
                id: 111,
            },
            {
                onError,
            },
        )
        ;(
            useDeleteMacroPrimitiveMock.mock.calls[0][0]
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
        const { result } = renderHook(() => useDeleteMacro())
        void result.current.mutateAsync(
            {
                id: 111,
            },
            {
                onSettled,
            },
        )
        ;(
            useDeleteMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: (resp: unknown) => void
            }
        )?.onSuccess({
            data: {
                id,
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully deleted macro',
            status: NotificationStatus.Success,
        })
    })
})
