import { act } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useExecuteCustomAction } from '../useExecuteCustomAction'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useExecuteCustomAction', () => {
    it('calls executeAction with correct payload for GET request', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useExecuteCustomAction())

        act(() => {
            result.current.mutate({
                integrationId: 1,
                customerId: 42,
                ticketId: '100',
                label: 'Test Action',
                action: {
                    method: 'GET',
                    url: 'https://api.example.com/test',
                    headers: [
                        {
                            id: '1',
                            key: 'Authorization',
                            value: 'Bearer token',
                        },
                    ],
                    params: [{ id: '2', key: 'q', value: 'search' }],
                    body: {
                        contentType: 'application/json',
                        'application/json': {},
                        'application/x-www-form-urlencoded': [],
                    },
                },
            })
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('customHttpAction')
            expect(body.action_label).toBe('Test Action')
            expect(body.user_id).toBe(42)
            expect(body.integration_id).toBe(1)
            expect(body.ticket_id).toBe(100)
            expect(body.payload.method).toBe('GET')
            expect(body.payload.url).toBe('https://api.example.com/test')
            expect(body.payload.headers).toEqual({
                Authorization: 'Bearer token',
            })
            expect(body.payload.params).toEqual({ q: 'search' })
        })
    })

    it('does not call mutation when customerId is missing', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const { result } = renderHook(() => useExecuteCustomAction())

        act(() => {
            result.current.mutate({
                integrationId: 1,
                customerId: undefined,
                label: 'Test',
                action: {
                    method: 'GET',
                    url: 'https://example.com',
                    headers: [],
                    params: [],
                    body: {
                        contentType: 'application/json',
                        'application/json': {},
                        'application/x-www-form-urlencoded': [],
                    },
                },
            })
        })

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('customerId is missing'),
        )
        warnSpy.mockRestore()
    })

    it('sends form body for POST with form content type', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useExecuteCustomAction())

        act(() => {
            result.current.mutate({
                customerId: 42,
                label: 'Submit Form',
                action: {
                    method: 'POST',
                    url: 'https://api.example.com/submit',
                    headers: [],
                    params: [],
                    body: {
                        contentType: 'application/x-www-form-urlencoded',
                        'application/json': {},
                        'application/x-www-form-urlencoded': [
                            { id: '1', key: 'field1', value: 'val1' },
                        ],
                    },
                },
            })
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.payload.content_type).toBe(
                'application/x-www-form-urlencoded',
            )
            expect(body.payload.form).toEqual({ field1: 'val1' })
        })
    })

    it('generates unique action_id', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useExecuteCustomAction())

        act(() => {
            result.current.mutate({
                integrationId: 5,
                customerId: 10,
                label: 'Action',
                action: {
                    method: 'GET',
                    url: 'https://example.com',
                    headers: [],
                    params: [],
                    body: {
                        contentType: 'application/json',
                        'application/json': {},
                        'application/x-www-form-urlencoded': [],
                    },
                },
            })
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_id).toBeDefined()
            expect(body.action_id).toContain('customHttpAction')
            expect(body.action_id).toContain('10')
        })
    })
})
