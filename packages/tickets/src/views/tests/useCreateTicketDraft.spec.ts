import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import { useCreateTicketDraft } from '../useCreateTicketDraft'

const {
    pushMock,
    getItemMock,
    clearMock,
    readyMock,
    unsubscribeMock,
    observeTableMock,
} = vi.hoisted(() => ({
    pushMock: vi.fn(),
    getItemMock: vi.fn(),
    clearMock: vi.fn().mockResolvedValue(undefined),
    readyMock: vi.fn().mockResolvedValue(undefined),
    unsubscribeMock: vi.fn(),
    observeTableMock: vi.fn(() => ({ unsubscribe: vi.fn() })),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory: () => ({ push: pushMock }),
    }
})

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: getItemMock,
            clear: clearMock,
            ready: readyMock,
        })),
        observeTable: observeTableMock,
    },
}))

const emptyDraft = {
    appliedMacro: null,
    assignee_team: null,
    assignee_user: null,
    attachments: [],
    custom_fields: {},
    customer: null,
    source: { type: 'email', to: [] },
    subject: '',
    tags: [],
    ticket: null,
}

describe('useCreateTicketDraft', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        clearMock.mockResolvedValue(undefined)
        readyMock.mockResolvedValue(undefined)
        observeTableMock.mockReturnValue({ unsubscribe: unsubscribeMock })
        getItemMock.mockResolvedValue(null)
        unsubscribeMock.mockReset()
    })

    describe('hasDraft', () => {
        it.each([
            { description: 'draft is null', draft: null, expected: false },
            {
                description: 'draft is empty',
                draft: emptyDraft,
                expected: false,
            },
            {
                description: 'message blocks contain only whitespace',
                draft: {
                    ...emptyDraft,
                    ticket: { contentState: { blocks: [{ text: '   ' }] } },
                },
                expected: false,
            },
            {
                description: 'draft has a subject',
                draft: { ...emptyDraft, subject: 'Hello world' },
                expected: true,
            },
            {
                description: 'draft has message body text',
                draft: {
                    ...emptyDraft,
                    ticket: {
                        contentState: { blocks: [{ text: 'Body text' }] },
                    },
                },
                expected: true,
            },
            {
                description: 'draft has a customer assigned',
                draft: { ...emptyDraft, customer: { id: 1 } },
                expected: true,
            },
            {
                description: 'draft has attachments',
                draft: { ...emptyDraft, attachments: [{ id: 1 }] },
                expected: true,
            },
            {
                description: 'source type is not email',
                draft: { ...emptyDraft, source: { type: 'chat' } },
                expected: true,
            },
        ])('is $expected when $description', async ({ draft, expected }) => {
            getItemMock.mockResolvedValue(draft)
            const { result } = renderHook(() => useCreateTicketDraft())
            await waitFor(() => {
                expect(result.current.hasDraft).toBe(expected)
            })
        })
    })

    describe('navigation actions', () => {
        it.each([
            { action: 'onCreateTicket' as const },
            { action: 'onResumeDraft' as const },
        ])('$action navigates to /app/ticket/new', ({ action }) => {
            const { result } = renderHook(() => useCreateTicketDraft())
            act(() => {
                result.current[action]()
            })
            expect(pushMock).toHaveBeenCalledWith('/app/ticket/new')
        })

        it('onDiscardDraft clears storage then navigates to /app/ticket/new', async () => {
            const { result } = renderHook(() => useCreateTicketDraft())
            await act(async () => {
                await result.current.onDiscardDraft()
            })
            expect(clearMock).toHaveBeenCalledTimes(1)
            expect(pushMock).toHaveBeenCalledWith('/app/ticket/new')
        })
    })

    describe('storage subscription', () => {
        it('subscribes to ticket-drafts store on mount', async () => {
            renderHook(() => useCreateTicketDraft())
            await waitFor(() => {
                expect(observeTableMock).toHaveBeenCalledWith(
                    'ticket-drafts',
                    expect.any(Function),
                )
            })
        })

        it('unsubscribes on unmount', async () => {
            const { unmount } = renderHook(() => useCreateTicketDraft())
            await waitFor(() => {
                expect(observeTableMock).toHaveBeenCalled()
            })
            unmount()
            expect(unsubscribeMock).toHaveBeenCalledTimes(1)
        })
    })
})
