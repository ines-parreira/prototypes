import { UserRole } from '@repo/permissions'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetCurrentUserHandler,
    mockGetCurrentUserResponse,
    mockGetViewHandler,
    mockGetViewResponse,
    mockUpdateViewHandler,
    mockUpdateViewResponse,
} from '@gorgias/helpdesk-mocks'
import { ViewField } from '@gorgias/helpdesk-types'
import type { View } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useTicketTableColumnVisibility } from '../useTicketTableColumnVisibility'

const viewId = 123
let updateViewRequestCount = 0

function mockCurrentUser(roleName = UserRole.Agent) {
    return mockGetCurrentUserHandler(async () =>
        HttpResponse.json(
            mockGetCurrentUserResponse({
                id: 1,
                role: { name: roleName },
            }),
        ),
    ).handler
}

function mockViewResponse(overrides: Partial<View> = {}) {
    return mockGetViewHandler(async () =>
        HttpResponse.json(
            mockGetViewResponse({
                id: viewId,
                category: 'custom',
                fields: undefined,
                ...overrides,
            }),
        ),
    ).handler
}

function mockUpdateView() {
    const updateViewMock = mockUpdateViewHandler(async () => {
        updateViewRequestCount += 1

        return HttpResponse.json(mockUpdateViewResponse())
    })

    return updateViewMock
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTicketTableColumnVisibility', () => {
    beforeEach(() => {
        updateViewRequestCount = 0
        server.use(
            mockCurrentUser(),
            mockViewResponse(),
            mockUpdateView().handler,
        )
    })

    it('returns all columns when the view has no saved fields', () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        expect(result.current.defaultVisibleColumns).toEqual([
            'select',
            'ticket',
            'subject',
            'integrations',
            'tags',
            'customer',
            'assignee_team',
            'assignee',
            'id',
            'status',
            'language',
            'channel',
            'created_datetime',
            'updated_datetime',
            'last_message_datetime',
            'last_received_message_datetime',
            'closed',
            'snooze',
            'priority',
        ])
        expect(result.current.defaultColumnOrder).toEqual([
            'select',
            'ticket',
            'subject',
            'integrations',
            'tags',
            'customer',
            'assignee_team',
            'assignee',
            'id',
            'status',
            'language',
            'channel',
            'created_datetime',
            'updated_datetime',
            'last_message_datetime',
            'last_received_message_datetime',
            'closed',
            'snooze',
            'priority',
        ])
    })

    it('maps view fields to column ids and prepends the mandatory ticket column', () => {
        server.use(
            mockViewResponse({
                fields: [
                    ViewField.Subject,
                    ViewField.Customer,
                    ViewField.Created,
                ],
            }),
        )

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        return waitFor(() => {
            expect(result.current.defaultVisibleColumns).toEqual([
                'select',
                'ticket',
                'subject',
                'customer',
                'created_datetime',
            ])
            expect(result.current.defaultColumnOrder).toEqual([
                'select',
                'ticket',
                'subject',
                'customer',
                'created_datetime',
                'integrations',
                'tags',
                'assignee_team',
                'assignee',
                'id',
                'status',
                'language',
                'channel',
                'updated_datetime',
                'last_message_datetime',
                'last_received_message_datetime',
                'closed',
                'snooze',
                'priority',
            ])
        })
    })

    it('keeps backend field order first and appends hidden columns in fallback order', () => {
        server.use(
            mockViewResponse({
                fields: [
                    ViewField.Subject,
                    ViewField.Assignee,
                    ViewField.Customer,
                ],
            }),
        )

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        return waitFor(() => {
            expect(result.current.defaultVisibleColumns).toEqual([
                'select',
                'ticket',
                'subject',
                'assignee',
                'customer',
            ])
            expect(result.current.defaultColumnOrder).toEqual([
                'select',
                'ticket',
                'subject',
                'assignee',
                'customer',
                'integrations',
                'tags',
                'assignee_team',
                'id',
                'status',
                'language',
                'channel',
                'created_datetime',
                'updated_datetime',
                'last_message_datetime',
                'last_received_message_datetime',
                'closed',
                'snooze',
                'priority',
            ])
        })
    })

    it('does not persist mapped fields when columns only change locally', () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        act(() => {
            result.current.onLocalChange([
                'select',
                'ticket',
                'subject',
                'customer',
                'priority',
                'created_datetime',
            ])
        })

        expect(updateViewRequestCount).toBe(0)
    })

    it('persists mapped fields and invalidates the view query on success', async () => {
        const updateViewMock = mockUpdateView()
        const waitForUpdateViewRequest = updateViewMock.waitForRequest(server)
        server.use(updateViewMock.handler)
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.canSaveForEveryone).toBe(true)
        })
        await result.current.saveForEveryone([
            'select',
            'ticket',
            'subject',
            'customer',
            'priority',
            'created_datetime',
        ])

        await waitForUpdateViewRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                fields: [
                    ViewField.Subject,
                    ViewField.Customer,
                    ViewField.Priority,
                    ViewField.Created,
                ],
            })
        })
    })

    it('omits selection and mandatory columns from the shared save payload', async () => {
        const updateViewMock = mockUpdateView()
        const waitForUpdateViewRequest = updateViewMock.waitForRequest(server)
        server.use(updateViewMock.handler)
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.canSaveForEveryone).toBe(true)
        })
        await result.current.saveForEveryone(['select', 'ticket'])

        await waitForUpdateViewRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                fields: [],
            })
        })
    })

    it('uses draft fields and skips persistence in draft mode', () => {
        const onDraftFieldsChange = vi.fn()

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId, {
                isDraftView: true,
                draftFields: [
                    ViewField.Subject,
                    ViewField.Customer,
                    ViewField.Created,
                ],
                onDraftFieldsChange,
            }),
        )

        expect(result.current.defaultVisibleColumns).toEqual([
            'select',
            'ticket',
            'subject',
            'customer',
            'created_datetime',
        ])
        expect(result.current.defaultColumnOrder).toEqual([
            'select',
            'ticket',
            'subject',
            'customer',
            'created_datetime',
            'integrations',
            'tags',
            'assignee_team',
            'assignee',
            'id',
            'status',
            'language',
            'channel',
            'updated_datetime',
            'last_message_datetime',
            'last_received_message_datetime',
            'closed',
            'snooze',
            'priority',
        ])

        act(() => {
            result.current.onLocalChange(['select', 'ticket', 'subject'])
        })

        expect(onDraftFieldsChange).toHaveBeenCalledWith([
            ViewField.Details,
            ViewField.Subject,
        ])

        act(() => {
            result.current.onColumnOrderChange([
                'ticket',
                'created_datetime',
                'customer',
                'subject',
                'status',
            ])
        })

        expect(onDraftFieldsChange).toHaveBeenLastCalledWith([
            ViewField.Details,
            ViewField.Created,
            ViewField.Customer,
            ViewField.Subject,
        ])
        expect(updateViewRequestCount).toBe(0)
        expect(result.current.canSaveForEveryone).toBe(false)
    })

    it('does not save for everyone in draft mode', async () => {
        const onDraftFieldsChange = vi.fn()
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId, {
                isDraftView: true,
                draftFields: [ViewField.Subject, ViewField.Customer],
                onDraftFieldsChange,
            }),
        )

        await result.current.saveForEveryone([
            'select',
            'ticket',
            'subject',
            'customer',
        ])

        expect(updateViewRequestCount).toBe(0)
    })

    it('does not save for everyone for unauthorized users', async () => {
        server.use(mockCurrentUser(UserRole.BasicAgent))

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.canSaveForEveryone).toBe(false)
        })

        await expect(
            result.current.saveForEveryone([
                'select',
                'ticket',
                'subject',
                'customer',
            ]),
        ).rejects.toThrow(
            'User does not have permission to save columns for everyone',
        )

        expect(updateViewRequestCount).toBe(0)
    })

    it('does not save for everyone for system views', async () => {
        server.use(
            mockViewResponse({
                category: 'system',
                fields: [ViewField.Subject, ViewField.Customer],
            }),
        )

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.defaultVisibleColumns).toEqual([
                'select',
                'ticket',
                'subject',
                'customer',
            ])
            expect(result.current.canSaveForEveryone).toBe(false)
        })

        await expect(
            result.current.saveForEveryone([
                'select',
                'ticket',
                'subject',
                'customer',
            ]),
        ).rejects.toThrow(
            'User does not have permission to save columns for everyone',
        )

        expect(updateViewRequestCount).toBe(0)
    })

    it('does not throw when draft column changes have no draft callback', () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId, {
                isDraftView: true,
                draftFields: [ViewField.Subject, ViewField.Customer],
            }),
        )

        act(() => {
            result.current.onLocalChange(['select', 'ticket', 'subject'])
            result.current.onColumnOrderChange(['ticket', 'subject'])
        })

        expect(updateViewRequestCount).toBe(0)
    })

    it('returns all columns for draft views when no draft fields are provided', () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId, {
                isDraftView: true,
            }),
        )

        expect(result.current.defaultVisibleColumns).toEqual([
            'select',
            'ticket',
            'subject',
            'integrations',
            'tags',
            'customer',
            'assignee_team',
            'assignee',
            'id',
            'status',
            'language',
            'channel',
            'created_datetime',
            'updated_datetime',
            'last_message_datetime',
            'last_received_message_datetime',
            'closed',
            'snooze',
            'priority',
        ])
        expect(result.current.defaultColumnOrder).toEqual([
            'select',
            'ticket',
            'subject',
            'integrations',
            'tags',
            'customer',
            'assignee_team',
            'assignee',
            'id',
            'status',
            'language',
            'channel',
            'created_datetime',
            'updated_datetime',
            'last_message_datetime',
            'last_received_message_datetime',
            'closed',
            'snooze',
            'priority',
        ])
    })

    it('returns save permissions for leads and admins only', async () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.canSaveForEveryone).toBe(true)
        })

        server.use(mockCurrentUser(UserRole.Admin))

        const { result: adminResult } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(adminResult.current.canSaveForEveryone).toBe(true)
        })

        server.use(mockCurrentUser(UserRole.BasicAgent))

        const { result: unauthorizedResult } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(unauthorizedResult.current.canSaveForEveryone).toBe(false)
        })

        server.use(
            mockGetCurrentUserHandler(async () => HttpResponse.json(null))
                .handler,
        )

        const { result: missingUserResult } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(missingUserResult.current.canSaveForEveryone).toBe(false)
        })
    })

    it('keeps local state intact when saving for everyone fails', async () => {
        const updateViewMock = mockUpdateViewHandler(async () => {
            updateViewRequestCount += 1

            return HttpResponse.json({ error: { msg: 'nope' } } as any, {
                status: 500,
            })
        })
        server.use(updateViewMock.handler)

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await waitFor(() => {
            expect(result.current.canSaveForEveryone).toBe(true)
        })
        await expect(
            result.current.saveForEveryone(['select', 'ticket', 'subject']),
        ).rejects.toBeTruthy()
        expect(updateViewRequestCount).toBe(1)
    })
})
