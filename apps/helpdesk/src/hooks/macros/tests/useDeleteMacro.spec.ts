import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockDeleteMacroHandler } from '@gorgias/helpdesk-mocks'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useDeleteMacro } from '../useDeleteMacro'

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

function renderUseDeleteMacro() {
    return renderHook(() => useDeleteMacro())
}

describe('useDeleteMacro', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
    })

    it('should delete a macro and notify on success', async () => {
        const deleteMacroMock = mockDeleteMacroHandler()
        const waitForDeleteMacroRequest = deleteMacroMock.waitForRequest(server)
        server.use(deleteMacroMock.handler)
        const { result } = renderUseDeleteMacro()

        await result.current.mutateAsync({ id: 111 })

        await waitForDeleteMacroRequest((request) => {
            expect(new URL(request.url).pathname).toContain('/macros/111')
        })
        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully deleted macro',
            status: NotificationStatus.Success,
        })
    })

    it('should handle failed request', async () => {
        const msg = 'nope'
        server.use(
            mockDeleteMacroHandler(async () =>
                HttpResponse.json({ error: { msg } } as never, { status: 400 }),
            ).handler,
        )
        const { result } = renderUseDeleteMacro()

        await expect(
            result.current.mutateAsync({ id: 111 }),
        ).rejects.toBeDefined()

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                title: msg,
                allowHTML: true,
                message: null,
                status: NotificationStatus.Error,
            })
        })
    })
})
