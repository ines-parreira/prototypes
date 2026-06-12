import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBulkUnarchiveMacrosHandler,
    mockBulkUnarchiveMacrosResponse,
} from '@gorgias/helpdesk-mocks'

import { useBulkUnarchiveMacros } from 'hooks/macros/useBulkUnarchiveMacros'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: jest.fn() }))
const useAppDispatchMock = jest.mocked(useAppDispatch)

jest.mock('state/notifications/actions')

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

function renderUseBulkUnarchiveMacros() {
    return renderHook(() => useBulkUnarchiveMacros())
}

describe('useBulkUnarchiveMacros', () => {
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should handle successful request with a single macro', async () => {
        server.use(
            mockBulkUnarchiveMacrosHandler(async () =>
                HttpResponse.json(
                    mockBulkUnarchiveMacrosResponse({
                        data: [{ id: 1, status: 'unarchived' }],
                    }),
                ),
            ).handler,
        )
        const { result } = renderUseBulkUnarchiveMacros()

        result.current.mutate({ data: { ids: [1] } })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: 'Successfully unarchived macro',
                status: NotificationStatus.Success,
            })
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('should handle successful request with multiple macros', async () => {
        server.use(
            mockBulkUnarchiveMacrosHandler(async () =>
                HttpResponse.json(
                    mockBulkUnarchiveMacrosResponse({
                        data: [
                            { id: 1, status: 'unarchived' },
                            { id: 2, status: 'unarchived' },
                        ],
                    }),
                ),
            ).handler,
        )
        const { result } = renderUseBulkUnarchiveMacros()

        result.current.mutate({ data: { ids: [1, 2] } })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: 'Successfully unarchived macros',
                status: NotificationStatus.Success,
            })
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('should handle nested unarchive results from the runtime response envelope', async () => {
        server.use(
            mockBulkUnarchiveMacrosHandler(async () =>
                HttpResponse.json({
                    data: mockBulkUnarchiveMacrosResponse({
                        data: [
                            { id: 1, status: 'unarchived' },
                            { id: 2, status: 'unarchived' },
                        ],
                    }),
                } as never),
            ).handler,
        )
        const { result } = renderUseBulkUnarchiveMacros()

        result.current.mutate({ data: { ids: [1, 2] } })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: 'Successfully unarchived macros',
                status: NotificationStatus.Success,
            })
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('should handle unarchive responses without result data', async () => {
        server.use(
            mockBulkUnarchiveMacrosHandler(async () =>
                HttpResponse.json({} as never),
            ).handler,
        )
        const { result } = renderUseBulkUnarchiveMacros()

        result.current.mutate({ data: { ids: [1] } })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: 'Successfully unarchived macro',
                status: NotificationStatus.Success,
            })
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('should handle failed request', async () => {
        const errorMessage =
            'Failed to unarchive macro(s). Please try again in a few seconds.'
        server.use(
            mockBulkUnarchiveMacrosHandler(async () =>
                HttpResponse.json({ error: { msg: errorMessage } } as never, {
                    status: 500,
                }),
            ).handler,
        )
        const { result } = renderUseBulkUnarchiveMacros()

        result.current.mutate({ data: { ids: [1, 2] } })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                title: errorMessage,
                message: undefined,
                allowHTML: true,
                status: NotificationStatus.Error,
            })
        })
        expect(dispatchMock).toHaveBeenCalled()
    })
})
