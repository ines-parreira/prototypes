import {useBulkUnarchiveMacros as useBulkUnarchiveMacrosPrimitive} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {useBulkUnarchiveMacros} from 'hooks/macros/useBulkUnarchiveMacros'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
    useBulkUnarchiveMacros: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({pop: () => null}),
        },
    },
}))

const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacrosPrimitive)
const mockMutateAsyncBulkUnarchive = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useBulkUnarchiveMacros', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient
        )
    })

    it('should handle successsful request with useBulkUnarchiveMacros with a single macro', () => {
        const onSuccess = jest.fn()
        const {result} = renderHook(() => useBulkUnarchiveMacros())
        void result.current.mutateAsync(
            {data: {ids: [1]}},
            {
                onSuccess,
            }
        )
        ;(
            useBulkUnarchiveMacrosMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: () => void
            }
        )?.onSuccess()

        expect(dispatchMock).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Successfully unarchived macro',
            status: NotificationStatus.Success,
        })
        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle successsful request with useBulkUnarchiveMacros with multiple macros', () => {
        const onSuccess = jest.fn()
        const {result} = renderHook(() => useBulkUnarchiveMacros())
        void result.current.mutateAsync(
            {data: {ids: [1, 2]}},
            {
                onSuccess,
            }
        )
        ;(
            useBulkUnarchiveMacrosMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onSuccess: (args: unknown) => void
            }
        )?.onSuccess({
            data: {
                data: {
                    data: [{id: 1}, {id: 2}],
                },
            },
        })

        expect(dispatchMock).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Successfully unarchived macros',
            status: NotificationStatus.Success,
        })
        expect(invalidateQueriesMock).toHaveBeenCalled()
    })

    it('should handle failed request with useBulkUnarchiveMacros', () => {
        const onError = jest.fn()
        const {result} = renderHook(() => useBulkUnarchiveMacros())
        void result.current.mutateAsync(
            {data: {ids: [1, 2]}},
            {
                onError,
            }
        )
        ;(
            useBulkUnarchiveMacrosMock.mock.calls[0][0]
                ?.mutation as unknown as {
                onError: (argss: unknown) => void
            }
        )?.onError({
            response: {
                data: {
                    error: {},
                },
            },
        })

        expect(dispatchMock).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            title: 'Failed to unarchive macro(s). Please try again in a few seconds.',
            message: undefined,
            allowHTML: true,
            status: NotificationStatus.Error,
        })
    })
})
