import type { ComponentType } from 'react'
import type React from 'react'

import { localForageManager } from '@repo/browser-storage'
import { renderHook } from '@repo/testing'
import { useTicketFieldsStore } from '@repo/tickets'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketMessageSourceType } from 'business/types/ticket'
import type { RootState, StoreDispatch } from 'state/types'

import { useNewTicketDraft } from '../hooks/useNewTicketDraft'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const mockSetItem = jest.fn()
const mockGetItem = jest.fn()
const mockGetTableObject = {
    getItem: mockGetItem,
    setItem: mockSetItem,
} as unknown as LocalForage

const defaultState = {
    newMessage: fromJS({
        state: {
            contentState: null,
            originalContentState: null,
            emailExtraAdded: false,
            inserted_discounts: [],
        },
        newMessage: {
            attachments: [],
            body_html: '',
            body_text: '',
            source: {
                type: TicketMessageSourceType.Email,
                to: [],
            },
        },
    }),
    ticket: fromJS({
        subject: '',
        tags: [],
        state: {
            appliedMacro: null,
        },
    }),
} as RootState

const defaultArgs = {
    subject: '',
    priority: undefined,
    assigneeUser: null,
    assigneeTeam: null,
    tags: [],
    customer: null,
}

const createStoredDraft = (overrides: Record<string, unknown> = {}) => ({
    appliedMacro: null,
    assignee_team: null,
    assignee_user: null,
    attachments: [],
    custom_fields: {},
    customer: null,
    priority: undefined,
    source: {
        type: TicketMessageSourceType.Email,
        to: [],
    },
    sourceType: TicketMessageSourceType.Email,
    subject: '',
    tags: [],
    ticket: null,
    temporaryId: '',
    ...overrides,
})

const createWrapper = (state: RootState = defaultState) =>
    (({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore(state)}>{children}</Provider>
    )) as unknown as ComponentType

describe('useNewTicketDraft', () => {
    beforeEach(() => {
        jest.spyOn(localForageManager, 'getTable').mockReturnValue(
            mockGetTableObject,
        )
        mockGetItem.mockResolvedValue(null)
        mockSetItem.mockResolvedValue(undefined)
        useTicketFieldsStore.getState().resetFields()
    })

    afterEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    it('returns null restoredLocalState initially', () => {
        const { result } = renderHook(() => useNewTicketDraft(defaultArgs), {
            wrapper: createWrapper(),
        })

        expect(result.current.restoredLocalState).toBeNull()
        expect(result.current.shouldAutoFocusSubject).toBe(false)
    })

    it('fetches draft from localForage on mount', async () => {
        renderHook(() => useNewTicketDraft(defaultArgs), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(mockGetItem).toHaveBeenCalledWith('new')
        })
    })

    describe('temporaryId management', () => {
        it('restores temporaryId from a non-empty stored draft', async () => {
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    assignee_user: { id: 1, name: 'John' },
                    subject: 'Stored subject',
                    temporaryId: 'stored-temp-id',
                }),
            )

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.temporaryId).toBe('stored-temp-id')
            })
        })

        it('generates a new temporaryId when stored draft is empty', async () => {
            mockGetItem.mockResolvedValue(
                createStoredDraft({ temporaryId: 'old-temp-id' }),
            )

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.temporaryId).toBeTruthy()
                expect(result.current.temporaryId).not.toBe('old-temp-id')
            })
        })
    })

    describe('draft hydration', () => {
        it('hydrates custom fields from a non-empty stored draft', async () => {
            const customFields = {
                '100': { id: 100, value: 'test-value' },
            }
            const storedDraft = createStoredDraft({
                assignee_team: { id: 2, name: 'Support' },
                assignee_user: { id: 1, name: 'John' },
                custom_fields: customFields,
                priority: 'high',
                subject: 'Draft subject',
                tags: [{ id: 1, name: 'urgent' }],
                temporaryId: 'stored-temp-id',
            })
            mockGetItem.mockResolvedValue(storedDraft)

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(useTicketFieldsStore.getState().fields).toEqual(
                    customFields,
                )
            })

            expect(result.current.temporaryId).toBe('stored-temp-id')

            expect(mockSetItem).not.toHaveBeenCalledWith(
                'new',
                expect.objectContaining({
                    custom_fields: {},
                }),
            )
        })

        it('does not overwrite a stored subject while hydrating custom fields', async () => {
            const customFields = {
                '100': { id: 100, value: 'test-value' },
            }
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    custom_fields: customFields,
                    subject: 'Stored subject',
                    temporaryId: 'stored-temp-id',
                }),
            )

            renderHook(() => useNewTicketDraft(defaultArgs), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(useTicketFieldsStore.getState().fields).toEqual(
                    customFields,
                )
            })

            expect(mockSetItem).not.toHaveBeenCalledWith(
                'new',
                expect.objectContaining({
                    custom_fields: customFields,
                    subject: '',
                }),
            )
        })

        it('replaces stale custom fields when hydrating a stored draft', async () => {
            useTicketFieldsStore.getState().updateFieldState({
                id: 100,
                value: 'existing-ticket-value',
                hasError: true,
            })

            const customFields = {
                '200': { id: 200, value: 'draft-value' },
            }
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    custom_fields: customFields,
                    subject: 'Draft subject',
                    temporaryId: 'stored-temp-id',
                }),
            )

            renderHook(() => useNewTicketDraft(defaultArgs), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(useTicketFieldsStore.getState().fields).toEqual(
                    customFields,
                )
            })
        })

        it('does not hydrate when stored draft is empty', async () => {
            mockGetItem.mockResolvedValue(
                createStoredDraft({ temporaryId: 'temp-id' }),
            )

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(mockGetItem).toHaveBeenCalledWith('new')
            })

            expect(result.current.restoredLocalState).toBeNull()
        })

        it('does not hydrate when no stored draft exists', async () => {
            useTicketFieldsStore.getState().updateFieldValue(100, 'stale value')
            mockGetItem.mockResolvedValue(null)

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(mockGetItem).toHaveBeenCalledWith('new')
            })

            expect(result.current.restoredLocalState).toBeNull()
            expect(useTicketFieldsStore.getState().fields).toEqual({})
        })

        it('clears stale custom fields when stored draft has no custom fields', async () => {
            useTicketFieldsStore.getState().updateFieldValue(100, 'stale value')
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    subject: 'Draft subject',
                    temporaryId: 'stored-temp-id',
                }),
            )

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.restoredLocalState).toEqual(
                    expect.objectContaining({
                        subject: 'Draft subject',
                        customFields: {},
                    }),
                )
            })

            expect(useTicketFieldsStore.getState().fields).toEqual({})
        })
    })

    describe('subject autofocus', () => {
        it('enables subject autofocus when there is no stored draft', async () => {
            mockGetItem.mockResolvedValue(null)

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.shouldAutoFocusSubject).toBe(true)
            })
        })

        it('enables subject autofocus when the stored draft has no subject', async () => {
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    assignee_user: { id: 1, name: 'John' },
                    temporaryId: 'stored-temp-id',
                }),
            )

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.temporaryId).toBe('stored-temp-id')
            })

            expect(result.current.shouldAutoFocusSubject).toBe(true)
        })

        it('does not enable subject autofocus when the stored draft has a subject', async () => {
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    subject: 'Stored subject',
                    temporaryId: 'stored-temp-id',
                }),
            )

            const { result } = renderHook(
                () => useNewTicketDraft(defaultArgs),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.temporaryId).toBe('stored-temp-id')
            })

            expect(result.current.shouldAutoFocusSubject).toBe(false)
        })
    })

    describe('draft persistence', () => {
        it('persists draft when form state is not empty and stored draft exists', async () => {
            mockGetItem.mockResolvedValue(
                createStoredDraft({
                    assignee_user: { id: 1, name: 'John' },
                    subject: 'Some subject',
                    temporaryId: 'temp-id',
                }),
            )

            const argsWithSubject = {
                ...defaultArgs,
                subject: 'Updated subject',
            }

            renderHook(() => useNewTicketDraft(argsWithSubject), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(mockSetItem).toHaveBeenCalledWith(
                    'new',
                    expect.objectContaining({
                        subject: 'Updated subject',
                    }),
                )
            })
        })

        it('does not persist draft when form state is empty and no stored draft exists', async () => {
            mockGetItem.mockResolvedValue(null)

            renderHook(() => useNewTicketDraft(defaultArgs), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(mockGetItem).toHaveBeenCalledWith('new')
            })

            expect(mockSetItem).not.toHaveBeenCalled()
        })
    })
})
