import {
    useBulkArchiveMacros as useBulkArchiveMacrosPrimitive,
    useBulkUnarchiveMacros as useBulkUnarchiveMacrosPrimitive,
} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {macros} from 'fixtures/macro'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

import {useBulkArchiveMacros, useBulkUnarchiveMacros} from '../hooks'

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
    useBulkArchiveMacros: jest.fn(),
    useBulkUnarchiveMacros: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({pop: () => null}),
        },
    },
}))

const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacrosPrimitive)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacrosPrimitive)
const mockMutateAsyncBulkArchive = jest.fn()
const mockMutateAsyncBulkUnarchive = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('settings > macros > hooks', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
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

    const macrosFixtures = [macros[0], macros[1]]

    it('should handle successful and failed requests with useBulkArchiveMacros', () => {
        const onSettled = jest.fn()
        const {result} = renderHook(() => useBulkArchiveMacros(macrosFixtures))
        void result.current.mutateAsync(
            {data: {ids: [1]}},
            {
                onSettled,
            }
        )
        const error = {
            msg: 'In use in a rule',
            data: {
                rules: ['rule1'],
            },
        }
        ;(
            useBulkArchiveMacrosMock.mock.calls[0][0]?.mutation as unknown as {
                onSettled: (resp: {data: {data: {data: unknown[]}}}) => void
            }
        )?.onSettled({
            data: {
                data: {
                    data: [
                        {
                            id: 1,
                            status: 'archived',
                        },
                        {
                            id: 2,
                            error,
                            status: 'macro_used',
                        },
                    ],
                },
            },
        })

        expect(dispatchMock).toHaveBeenCalled()
        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `Successfully archived macro: ${macrosFixtures[0].name}`,
            status: NotificationStatus.Success,
        })
        expect(notify).toHaveBeenNthCalledWith(2, {
            allowHTML: true,
            title: `${macrosFixtures[1].name}: ${error.msg}`,
            message: expect.stringMatching(error.data.rules[0]),
            status: NotificationStatus.Error,
        })
        expect(invalidateQueriesMock).toHaveBeenCalled()
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
