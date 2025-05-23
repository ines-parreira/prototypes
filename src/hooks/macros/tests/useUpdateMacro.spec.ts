import { QueryClient, useQueryClient } from '@tanstack/react-query'

import { useUpdateMacro as useUpdateMacroPrimitive } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useUpdateMacro } from '../useUpdateMacro'

jest.mock('@gorgias/helpdesk-queries', () => ({
    __esModule: true,
    useUpdateMacro: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({ pop: () => null }),
        },
    },
}))

const useUpdateMacroPrimitiveMock = assumeMock(useUpdateMacroPrimitive)
const mockMutateUpdateMacro = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useUpdateMacro', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useUpdateMacroPrimitiveMock.mockReturnValue({
            mutateAsync: mockMutateUpdateMacro,
        } as unknown as ReturnType<typeof useUpdateMacroPrimitive>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should handle settled request', () => {
        const onSettled = jest.fn()
        const { result } = renderHook(() => useUpdateMacro())

        void result.current.mutateAsync(
            {
                id: 1,
                data: {
                    name: 'New Name',
                },
            },
            {
                onSettled,
            },
        )
        ;(
            useUpdateMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSettled: () => void
            }
        )?.onSettled()

        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle failed request', () => {
        const errorMessage = 'nope'
        const onSettled = jest.fn()
        const { result } = renderHook(() => useUpdateMacro(errorMessage))
        void result.current.mutateAsync(
            {
                id: 1,
                data: {
                    name: 'New Name',
                },
            },
            {
                onSettled,
            },
        )
        ;(
            useUpdateMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onError: (args: unknown) => void
            }
        )?.onError({
            response: {
                data: {
                    error: {},
                },
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            title: errorMessage,
            status: NotificationStatus.Error,
            allowHTML: true,
            message: null,
        })
    })

    it('should handle successful request', () => {
        const id = 111
        const onSettled = jest.fn()
        const { result } = renderHook(() => useUpdateMacro())
        void result.current.mutateAsync(
            {
                id: 1,
                data: {
                    name: 'New Name',
                },
            },
            {
                onSettled,
            },
        )
        ;(
            useUpdateMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: (resp: unknown) => void
            }
        )?.onSuccess({
            data: {
                id,
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully updated macro',
            status: NotificationStatus.Success,
        })
    })
})
