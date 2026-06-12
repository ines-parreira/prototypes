import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBulkArchiveMacrosHandler,
    mockBulkArchiveMacrosResponse,
} from '@gorgias/helpdesk-mocks'

import { macros } from 'fixtures/macro'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useBulkArchiveMacros } from '../useBulkArchiveMacros'

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

function renderUseBulkArchiveMacros(macrosFixtures = macros) {
    return renderHook(() => useBulkArchiveMacros(macrosFixtures))
}

describe('useBulkArchiveMacros', () => {
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should handle successful and failed archive results', async () => {
        const archivedMacro = { ...macros[0], id: 1 }
        const macroUsedInRule = { ...macros[1], id: 2 }
        const error = {
            msg: 'In use in a rule',
            data: {
                rules: ['rule1'],
            },
        }
        const bulkArchiveMacrosMock = mockBulkArchiveMacrosHandler(async () =>
            HttpResponse.json(
                mockBulkArchiveMacrosResponse({
                    data: [
                        {
                            id: archivedMacro.id,
                            status: 'archived',
                        },
                        {
                            id: macroUsedInRule.id,
                            error,
                            status: 'macro_used',
                        },
                    ],
                }),
            ),
        )
        const waitForBulkArchiveMacrosRequest =
            bulkArchiveMacrosMock.waitForRequest(server)
        server.use(bulkArchiveMacrosMock.handler)
        const { result } = renderUseBulkArchiveMacros([
            archivedMacro,
            macroUsedInRule,
        ])

        result.current.mutate({
            data: { ids: [archivedMacro.id, macroUsedInRule.id] },
        })

        await waitForBulkArchiveMacrosRequest(async (request) => {
            expect(await request.json()).toEqual({
                ids: [archivedMacro.id, macroUsedInRule.id],
            })
        })
        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: `Successfully archived macro: ${archivedMacro.name}`,
                status: NotificationStatus.Success,
            })
        })
        expect(notify).toHaveBeenNthCalledWith(2, {
            allowHTML: true,
            title: `${macroUsedInRule.name}: ${error.msg}`,
            message: expect.stringMatching(error.data.rules[0]),
            status: NotificationStatus.Error,
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('should handle nested archive results from the runtime response envelope', async () => {
        const archivedMacro = { ...macros[0], id: 1 }
        server.use(
            mockBulkArchiveMacrosHandler(async () =>
                HttpResponse.json({
                    data: mockBulkArchiveMacrosResponse({
                        data: [
                            {
                                id: archivedMacro.id,
                                status: 'archived',
                            },
                        ],
                    }),
                } as never),
            ).handler,
        )
        const { result } = renderUseBulkArchiveMacros([archivedMacro])

        result.current.mutate({
            data: { ids: [archivedMacro.id] },
        })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: `Successfully archived macro: ${archivedMacro.name}`,
                status: NotificationStatus.Success,
            })
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('should handle archive responses without result data', async () => {
        server.use(
            mockBulkArchiveMacrosHandler(async () =>
                HttpResponse.json({} as never),
            ).handler,
        )
        const { result } = renderUseBulkArchiveMacros()

        result.current.mutate({ data: { ids: [1, 2] } })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
        expect(notify).not.toHaveBeenCalled()
    })

    it('should handle failed archive request', async () => {
        const errorMessage =
            'Failed to archive macro(s). Please try again in a few seconds.'
        server.use(
            mockBulkArchiveMacrosHandler(async () =>
                HttpResponse.json({ error: { msg: errorMessage } } as never, {
                    status: 500,
                }),
            ).handler,
        )
        const { result } = renderUseBulkArchiveMacros()

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
