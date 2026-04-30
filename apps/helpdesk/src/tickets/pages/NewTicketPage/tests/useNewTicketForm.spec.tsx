import type { ComponentType } from 'react'
import type React from 'react'

import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketMessageSourceType } from 'business/types/ticket'
import { findAndSetCustomer } from 'state/ticket/actions'
import type { RootState, StoreDispatch } from 'state/types'

import type { RestoredLocalState } from '../hooks/useNewTicketDraft'
import { useNewTicketPageForm } from '../hooks/useNewTicketForm'

jest.mock('../hooks/useNewTicketDraft')
jest.mock('../hooks/useNewTicketSubmit')
jest.mock('state/ticket/actions', () => ({
    ...jest.requireActual('state/ticket/actions'),
    findAndSetCustomer: jest.fn(),
}))

const mockSubmit = jest.fn()
const mockUseNewTicketDraft = jest.mocked(
    jest.requireMock<typeof import('../hooks/useNewTicketDraft')>(
        '../hooks/useNewTicketDraft',
    ).useNewTicketDraft,
)
const mockUseNewTicketSubmit = jest.mocked(
    jest.requireMock<typeof import('../hooks/useNewTicketSubmit')>(
        '../hooks/useNewTicketSubmit',
    ).useNewTicketSubmit,
)

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

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

const createWrapper = (state: RootState = defaultState) =>
    (({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore(state)}>{children}</Provider>
    )) as unknown as ComponentType

describe('useNewTicketPageForm', () => {
    beforeEach(() => {
        mockUseNewTicketDraft.mockReturnValue({
            temporaryId: 'test-temp-id',
            restoredLocalState: null,
        })

        mockUseNewTicketSubmit.mockReturnValue({
            submit: mockSubmit,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns default empty ticket state with temporaryId and submit from dependent hooks', () => {
        const { result } = renderHook(() => useNewTicketPageForm(), {
            wrapper: createWrapper(),
        })

        expect(result.current.ticketState).toEqual({
            subject: '',
            priority: undefined,
            assigneeUser: null,
            assigneeTeam: null,
            tags: [],
            customer: null,
        })
        expect(result.current.temporaryId).toBe('test-temp-id')
        expect(result.current.submit).toBe(mockSubmit)
    })

    describe('form handlers', () => {
        it('updates subject via handleSubjectChange', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleSubjectChange('New ticket subject')
            })

            expect(result.current.ticketState.subject).toBe(
                'New ticket subject',
            )
        })

        it('updates priority via handlePriorityChange', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handlePriorityChange('high' as any)
            })

            expect(result.current.ticketState.priority).toBe('high')
        })

        it('updates assigneeUser via handleUserChange', () => {
            const user = { id: 1, name: 'John Doe' }
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleUserChange(user as any)
            })

            expect(result.current.ticketState.assigneeUser).toEqual(user)
        })

        it('clears assigneeUser when handleUserChange receives null', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleUserChange({
                    id: 1,
                    name: 'John',
                } as any)
            })

            expect(result.current.ticketState.assigneeUser).not.toBeNull()

            act(() => {
                result.current.handleUserChange(null)
            })

            expect(result.current.ticketState.assigneeUser).toBeNull()
        })

        it('updates assigneeTeam via handleTeamChange', () => {
            const team = { id: 1, name: 'Support' }
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleTeamChange(team as any)
            })

            expect(result.current.ticketState.assigneeTeam).toEqual(team)
        })

        it('clears assigneeTeam when handleTeamChange receives null', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleTeamChange({
                    id: 1,
                    name: 'Support',
                } as any)
            })

            expect(result.current.ticketState.assigneeTeam).not.toBeNull()

            act(() => {
                result.current.handleTeamChange(null)
            })

            expect(result.current.ticketState.assigneeTeam).toBeNull()
        })

        it('updates tags via handleTagsChange', () => {
            const tags = [
                { id: 1, name: 'urgent' },
                { id: 2, name: 'vip' },
            ]
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleTagsChange(tags as any)
            })

            expect(result.current.ticketState.tags).toEqual(tags)
        })
    })

    describe('handleRecipientsChange', () => {
        it('calls findAndSetCustomer when a single "to" recipient with id is set', () => {
            const mockFindAndSetCustomer = jest.mocked(findAndSetCustomer)
            const mockAction = { type: 'FIND_AND_SET_CUSTOMER' }
            mockFindAndSetCustomer.mockReturnValue(mockAction as any)

            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleRecipientsChange('to', [
                    { id: 42, address: 'customer@example.com' },
                ] as any)
            })

            expect(mockFindAndSetCustomer).toHaveBeenCalledWith(42)
        })

        it('clears customer when "to" recipients are emptied', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleRecipientsChange('to', [])
            })

            expect(result.current.ticketState.customer).toBeNull()
        })

        it('does not call findAndSetCustomer when prop is not "to"', () => {
            const mockFindAndSetCustomer = jest.mocked(findAndSetCustomer)

            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleRecipientsChange('cc', [
                    { id: 1, address: 'cc@example.com' },
                ] as any)
            })

            expect(mockFindAndSetCustomer).not.toHaveBeenCalled()
        })

        it('does not call findAndSetCustomer when multiple "to" recipients are set', () => {
            const mockFindAndSetCustomer = jest.mocked(findAndSetCustomer)

            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleRecipientsChange('to', [
                    { id: 1, address: 'a@example.com' },
                    { id: 2, address: 'b@example.com' },
                ] as any)
            })

            expect(mockFindAndSetCustomer).not.toHaveBeenCalled()
        })
    })

    describe('draft restoration', () => {
        it('restores ticket state from restoredLocalState', async () => {
            const restoredState: RestoredLocalState = {
                subject: 'Restored subject',
                priority: 'urgent' as any,
                assigneeUser: { id: 1, name: 'John' } as any,
                assigneeTeam: { id: 2, name: 'Support' } as any,
                tags: [{ id: 1, name: 'tag1' }] as any,
                customFields: {},
            }

            mockUseNewTicketDraft.mockReturnValue({
                temporaryId: 'restored-temp-id',
                restoredLocalState: restoredState,
            })

            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.ticketState.subject).toBe(
                    'Restored subject',
                )
            })

            expect(result.current.ticketState.priority).toBe('urgent')
            expect(result.current.ticketState.assigneeUser).toEqual({
                id: 1,
                name: 'John',
            })
            expect(result.current.ticketState.assigneeTeam).toEqual({
                id: 2,
                name: 'Support',
            })
            expect(result.current.ticketState.tags).toEqual([
                { id: 1, name: 'tag1' },
            ])
        })

        it('does not override customer from restored state', async () => {
            const restoredState: RestoredLocalState = {
                subject: 'Restored',
                priority: undefined,
                assigneeUser: null,
                assigneeTeam: null,
                tags: [],
                customFields: {},
            }

            mockUseNewTicketDraft.mockReturnValue({
                temporaryId: 'temp-id',
                restoredLocalState: restoredState,
            })

            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.ticketState.subject).toBe('Restored')
            })

            expect(result.current.ticketState.customer).toBeNull()
        })
    })

    describe('passes current state to dependent hooks', () => {
        it('passes updated state to useNewTicketDraft', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleSubjectChange('Updated subject')
            })

            const lastCall =
                mockUseNewTicketDraft.mock.calls[
                    mockUseNewTicketDraft.mock.calls.length - 1
                ]
            expect(lastCall[0]).toEqual(
                expect.objectContaining({
                    subject: 'Updated subject',
                }),
            )
        })

        it('passes updated state to useNewTicketSubmit', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handlePriorityChange('high' as any)
            })

            const lastCall =
                mockUseNewTicketSubmit.mock.calls[
                    mockUseNewTicketSubmit.mock.calls.length - 1
                ]
            expect(lastCall[0]).toEqual(
                expect.objectContaining({
                    priority: 'high',
                }),
            )
        })
    })
})
