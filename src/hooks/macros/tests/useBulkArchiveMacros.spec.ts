import {useBulkArchiveMacros as useBulkArchiveMacrosPrimitive} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {macros} from 'fixtures/macro'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

import {useBulkArchiveMacros} from '../useBulkArchiveMacros'

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
    useBulkArchiveMacros: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({pop: () => null}),
        },
    },
}))

const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacrosPrimitive)
const mockMutateAsyncBulkArchive = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('useBulkArchiveMacros', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
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

    it('should handle failed request with useBulkArchiveMacros', () => {
        const onError = jest.fn()
        const {result} = renderHook(() => useBulkArchiveMacros())
        void result.current.mutateAsync(
            {data: {ids: [1, 2]}},
            {
                onError,
            }
        )
        ;(
            useBulkArchiveMacrosMock.mock.calls[0][0]?.mutation as unknown as {
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
            title: 'Failed to archive macro(s). Please try again in a few seconds.',
            message: undefined,
            allowHTML: true,
            status: NotificationStatus.Error,
        })
    })
})
