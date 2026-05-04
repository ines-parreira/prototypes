import type { ComponentType } from 'react'
import type React from 'react'

import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getCustomer } from '@gorgias/helpdesk-client'

import { TicketMessageSourceType } from 'business/types/ticket'
import type { RootState, StoreDispatch } from 'state/types'

import type { RestoredLocalState } from '../hooks/useNewTicketDraft'
import { useNewTicketPageForm } from '../hooks/useNewTicketForm'

jest.mock('../hooks/useNewTicketDraft')
jest.mock('../hooks/useNewTicketSubmit')
jest.mock('@gorgias/helpdesk-client', () => ({
    getCustomer: jest.fn(),
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

const createWrapperWithStore = (store: ReturnType<typeof mockStore>) =>
    (({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
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
        it('sets customer when a single "to" recipient with id is set', async () => {
            const customer = { id: 42, name: 'Jane Doe' }
            jest.mocked(getCustomer).mockResolvedValue({
                data: customer,
            } as any)

            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            await act(async () => {
                await result.current.handleRecipientsChange('to', [
                    { id: 42, address: 'customer@example.com' },
                ] as any)
            })

            expect(getCustomer).toHaveBeenCalledWith(42)
            expect(result.current.ticketState.customer).toEqual(customer)
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

        it('does not fetch customer when prop is not "to"', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleRecipientsChange('cc', [
                    { id: 1, address: 'cc@example.com' },
                ] as any)
            })

            expect(getCustomer).not.toHaveBeenCalled()
        })

        it('does not fetch customer when multiple "to" recipients are set', () => {
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.handleRecipientsChange('to', [
                    { id: 1, address: 'a@example.com' },
                    { id: 2, address: 'b@example.com' },
                ] as any)
            })

            expect(getCustomer).not.toHaveBeenCalled()
        })
    })

    describe('handleCustomerChange', () => {
        it('sets the selected customer as the "to" recipient', () => {
            const store = mockStore(defaultState)
            const customer = {
                id: 42,
                name: 'Jane Doe',
                email: 'jane@example.com',
                channels: [],
            }
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapperWithStore(store),
            })

            act(() => {
                result.current.handleCustomerChange(customer as any)
            })

            expect(result.current.ticketState.customer).toEqual(customer)
            expect(store.getActions()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        receivers: {
                            to: [
                                {
                                    id: 42,
                                    name: 'Jane Doe',
                                    address: 'jane@example.com',
                                },
                            ],
                        },
                        replaceAll: false,
                    }),
                ]),
            )
        })

        it('falls back to the preferred customer channel when the customer has no email', () => {
            const store = mockStore(defaultState)
            const customer = {
                id: 43,
                name: 'Phone Customer',
                email: null,
                channels: [
                    {
                        id: 1,
                        type: 'phone',
                        address: '+15551234567',
                        preferred: true,
                    },
                ],
            }
            const { result } = renderHook(() => useNewTicketPageForm(), {
                wrapper: createWrapperWithStore(store),
            })

            act(() => {
                result.current.handleCustomerChange(customer as any)
            })

            expect(store.getActions()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        receivers: {
                            to: [
                                {
                                    id: 43,
                                    name: 'Phone Customer',
                                    address: '+15551234567',
                                },
                            ],
                        },
                        replaceAll: false,
                    }),
                ]),
            )
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
                customer: null,
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
                customer: null,
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
