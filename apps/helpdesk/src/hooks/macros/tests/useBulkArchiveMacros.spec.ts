import { renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBulkArchiveMacrosHandler,
    mockBulkArchiveMacrosResponse,
} from '@gorgias/helpdesk-mocks'

import { macros } from 'fixtures/macro'

import { useBulkArchiveMacros } from '../useBulkArchiveMacros'

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
        const successToast = await screen.findByRole('status', {
            name: `Successfully archived macro: ${archivedMacro.name}`,
        })
        expect(successToast).toHaveAttribute('data-intent', 'success')

        const errorToast = await screen.findByRole('status', {
            name: `${macroUsedInRule.name}: ${error.msg}`,
        })
        expect(errorToast).toHaveAttribute('data-intent', 'destructive')
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

        const toastEl = await screen.findByRole('status', {
            name: `Successfully archived macro: ${archivedMacro.name}`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
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
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
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

        const toastEl = await screen.findByRole('status', {
            name: errorMessage,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
