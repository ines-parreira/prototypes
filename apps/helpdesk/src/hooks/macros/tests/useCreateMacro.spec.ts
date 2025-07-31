import { renderHook } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'

import { useCreateMacro as useCreateMacroPrimitive } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useCreateMacro } from '../useCreateMacro'

jest.mock('@gorgias/helpdesk-queries', () => ({
    __esModule: true,
    useCreateMacro: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({ pop: () => null }),
        },
    },
}))

const useCreateMacroPrimitiveMock = assumeMock(useCreateMacroPrimitive)
const mockMutateCreateMacro = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useCreateMacro', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useCreateMacroPrimitiveMock.mockReturnValue({
            mutateAsync: mockMutateCreateMacro,
        } as unknown as ReturnType<typeof useCreateMacroPrimitive>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    it('should handle settled request', () => {
        const onSettled = jest.fn()
        const { result } = renderHook(() => useCreateMacro())

        void result.current.mutateAsync(
            {
                data: {
                    name: 'New Macro',
                },
            },
            {
                onSettled,
            },
        )
        ;(
            useCreateMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSettled: () => void
            }
        )?.onSettled()

        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle failed request', () => {
        const errorMessage = 'nope'
        const onSettled = jest.fn()
        const { result } = renderHook(() => useCreateMacro())
        void result.current.mutateAsync(
            {
                data: {
                    name: 'New Macro',
                },
            },
            {
                onSettled,
            },
        )
        ;(
            useCreateMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onError: (args: unknown) => void
            }
        )?.onError({
            response: {
                data: {
                    error: { msg: errorMessage },
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
        const { result } = renderHook(() => useCreateMacro())
        void result.current.mutateAsync(
            {
                data: {
                    name: 'New Macro',
                },
            },
            {
                onSettled,
            },
        )
        ;(
            useCreateMacroPrimitiveMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: (resp: unknown) => void
            }
        )?.onSuccess({
            data: {
                id,
            },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully created macro',
            status: NotificationStatus.Success,
        })
    })
})
