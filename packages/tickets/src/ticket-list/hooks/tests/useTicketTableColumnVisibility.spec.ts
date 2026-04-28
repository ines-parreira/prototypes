import { UserRole } from '@repo/permissions'
import { QueryClient } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import { ViewField } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { useTicketTableColumnVisibility } from '../useTicketTableColumnVisibility'

const useGetCurrentUserMock = vi.fn()
const useGetViewMock = vi.fn()
const mutateAsyncUpdateViewMock = vi.fn()
const useUpdateViewMock = vi.fn()
vi.mock('@gorgias/helpdesk-queries', () => ({
    queryKeys: {
        views: {
            getView: (viewId: number) => ['views', viewId],
        },
    },
    useGetCurrentUser: () => useGetCurrentUserMock(),
    useGetView: () => useGetViewMock(),
    useUpdateView: () => useUpdateViewMock(),
}))

const viewId = 123
const agentUser = {
    data: {
        id: 1,
        role: { name: UserRole.Agent },
    },
}

describe('useTicketTableColumnVisibility', () => {
    beforeEach(() => {
        useGetCurrentUserMock.mockReturnValue({
            data: agentUser,
        })
        useGetViewMock.mockReturnValue({
            data: {
                data: {
                    fields: undefined,
                },
            },
        })
        mutateAsyncUpdateViewMock.mockReset()
        mutateAsyncUpdateViewMock.mockResolvedValue(undefined)
        useUpdateViewMock.mockReturnValue({
            mutateAsync: mutateAsyncUpdateViewMock,
            isLoading: false,
        })
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
        useGetViewMock.mockReturnValue({
            data: {
                data: {
                    fields: [
                        ViewField.Subject,
                        ViewField.Customer,
                        ViewField.Created,
                    ],
                },
            },
        })

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
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
    })

    it('keeps backend field order first and appends hidden columns in fallback order', () => {
        useGetViewMock.mockReturnValue({
            data: {
                data: {
                    fields: [
                        ViewField.Subject,
                        ViewField.Assignee,
                        ViewField.Customer,
                    ],
                },
            },
        })

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

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

        expect(mutateAsyncUpdateViewMock).not.toHaveBeenCalled()
    })

    it('persists mapped fields and invalidates the view query on success', async () => {
        const invalidateQueriesSpy = vi.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await result.current.saveForEveryone([
            'select',
            'ticket',
            'subject',
            'customer',
            'priority',
            'created_datetime',
        ])

        expect(mutateAsyncUpdateViewMock).toHaveBeenCalledWith({
            id: viewId,
            data: {
                fields: [
                    ViewField.Subject,
                    ViewField.Customer,
                    ViewField.Priority,
                    ViewField.Created,
                ],
            },
        })
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ['views', viewId],
        })
    })

    it('omits selection and mandatory columns from the shared save payload', async () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await result.current.saveForEveryone(['select', 'ticket'])

        expect(mutateAsyncUpdateViewMock).toHaveBeenCalledWith({
            id: viewId,
            data: {
                fields: [],
            },
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
        expect(mutateAsyncUpdateViewMock).not.toHaveBeenCalled()
        expect(result.current.canSaveForEveryone).toBe(false)
    })

    it('does not save for everyone in draft mode', async () => {
        const onDraftFieldsChange = vi.fn()
        const invalidateQueriesSpy = vi.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
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

        expect(mutateAsyncUpdateViewMock).not.toHaveBeenCalled()
        expect(invalidateQueriesSpy).not.toHaveBeenCalled()
    })

    it('does not save for everyone for unauthorized users', async () => {
        useGetCurrentUserMock.mockReturnValue({
            data: {
                data: {
                    id: 2,
                    role: { name: UserRole.BasicAgent },
                },
            },
        })

        const invalidateQueriesSpy = vi.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

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

        expect(mutateAsyncUpdateViewMock).not.toHaveBeenCalled()
        expect(invalidateQueriesSpy).not.toHaveBeenCalled()
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

        expect(mutateAsyncUpdateViewMock).not.toHaveBeenCalled()
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

    it('returns save permissions for leads and admins only', () => {
        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        expect(result.current.canSaveForEveryone).toBe(true)

        useGetCurrentUserMock.mockReturnValue({
            data: {
                data: {
                    id: 3,
                    role: { name: UserRole.Admin },
                },
            },
        })

        const { result: adminResult } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        expect(adminResult.current.canSaveForEveryone).toBe(true)

        useGetCurrentUserMock.mockReturnValue({
            data: {
                data: {
                    id: 2,
                    role: { name: UserRole.BasicAgent },
                },
            },
        })

        const { result: unauthorizedResult } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        expect(unauthorizedResult.current.canSaveForEveryone).toBe(false)

        useGetCurrentUserMock.mockReturnValue({
            data: undefined,
        })

        const { result: missingUserResult } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        expect(missingUserResult.current.canSaveForEveryone).toBe(false)
    })

    it('keeps local state intact when saving for everyone fails', async () => {
        mutateAsyncUpdateViewMock.mockRejectedValueOnce(new Error('nope'))

        const { result } = renderHook(() =>
            useTicketTableColumnVisibility(viewId),
        )

        await expect(
            result.current.saveForEveryone(['select', 'ticket', 'subject']),
        ).rejects.toThrow('nope')
        expect(mutateAsyncUpdateViewMock).toHaveBeenCalledTimes(1)
    })
})
