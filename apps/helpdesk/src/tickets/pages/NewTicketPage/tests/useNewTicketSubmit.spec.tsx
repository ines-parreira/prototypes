import type { ComponentType } from 'react'
import type React from 'react'

import { localForageManager } from '@repo/browser-storage'
import { act, renderHook } from '@repo/testing'
import { MacroActionName, useTicketFieldsStore } from '@repo/tickets'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type {
    TicketPriority,
    TicketTag,
    TicketTeam,
    TicketUser,
} from '@gorgias/helpdesk-queries'

import { TicketMessageSourceType } from 'business/types/ticket'
import type { Ticket as TicketModel } from 'models/ticket/types'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import type { RootState, StoreDispatch } from 'state/types'

import { useNewTicketSubmit } from '../hooks/useNewTicketSubmit'

jest.mock(
    'pages/tickets/detail/components/ReplyArea/TicketReplyEditor',
    () => ({
        updateMessageText: {
            flush: jest.fn(),
        },
    }),
)

jest.mock('state/newMessage/actions', () => ({
    submitTicket: jest.fn(),
}))

const submitTicket = jest.mocked(
    jest.requireMock<typeof import('state/newMessage/actions')>(
        'state/newMessage/actions',
    ).submitTicket,
)

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultArgs = {
    subject: 'New ticket subject',
    priority: undefined,
    assigneeUser: null,
    assigneeTeam: null,
    tags: [],
    customer: null,
    temporaryId: 'temporary-ticket-id',
}

const buildState = ({
    appliedMacroActions = [],
    bodyText = 'Hello',
    customer = { id: 1, name: 'Original customer' },
    isLoading = false,
    receiver = { id: 2, name: 'Receiver customer' },
    sourceType = TicketMessageSourceType.Email,
}: {
    appliedMacroActions?: Array<{ name: string }>
    bodyText?: string
    customer?: Record<string, unknown> | null
    isLoading?: boolean
    receiver?: Record<string, unknown>
    sourceType?: TicketMessageSourceType
} = {}) =>
    ({
        currentAccount: fromJS({
            status: { status: 'active' },
        }),
        currentUser: fromJS({
            id: 123,
        }),
        newMessage: fromJS({
            _internal: {
                loading: {
                    submitMessage: isLoading,
                },
            },
            newMessage: {
                attachments: [],
                body_html: bodyText ? `<p>${bodyText}</p>` : '',
                body_text: bodyText,
                public: sourceType !== TicketMessageSourceType.InternalNote,
                receiver,
                source: {
                    type: sourceType,
                    to:
                        sourceType === TicketMessageSourceType.Email
                            ? [{ address: 'customer@example.com' }]
                            : [],
                },
            },
        }),
        ticket: fromJS({
            customer,
            state: {
                appliedMacro: {
                    actions: appliedMacroActions,
                },
            },
        }),
    }) as RootState

const createWrapper = (state: RootState) =>
    (({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore(state)}>{children}</Provider>
    )) as unknown as ComponentType

const renderUseNewTicketSubmit = (
    args: Parameters<typeof useNewTicketSubmit>[0] = defaultArgs,
    state: RootState = buildState(),
) =>
    renderHook(() => useNewTicketSubmit(args), {
        wrapper: createWrapper(state),
    })

async function submitNewTicket(
    result: ReturnType<typeof renderUseNewTicketSubmit>['result'],
    args: SubmitArgs = { status: 'open' } as SubmitArgs,
) {
    await act(async () => {
        await result.current.submit(args)
    })
}

describe('useNewTicketSubmit', () => {
    beforeEach(() => {
        submitTicket.mockReturnValue(async () => ({ error: undefined }))
        jest.spyOn(localForageManager, 'clearTable').mockReturnValue(
            undefined as never,
        )
        useTicketFieldsStore.getState().resetFields()
    })

    afterEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    it('submits the ticket with form fields and clears the local draft on success', async () => {
        useTicketFieldsStore.getState().updateFieldState({
            id: 1,
            value: 'Custom value',
        })

        const args = {
            ...defaultArgs,
            assigneeTeam: { id: 10, name: 'Support' } as TicketTeam,
            assigneeUser: { id: 20, name: 'Agent' } as TicketUser,
            customer: { id: 2, name: 'Receiver customer' } as NonNullable<
                TicketModel['customer']
            >,
            priority: 'urgent' as TicketPriority,
            tags: [{ id: 30, name: 'vip' }] as TicketTag[],
        }

        const { result } = renderUseNewTicketSubmit(args)

        await submitNewTicket(result)

        const submittedTicket = submitTicket.mock.calls[0][0]

        expect(submittedTicket.getIn(['newMessage', 'sender'])).toEqual({
            id: 123,
        })
        expect(submittedTicket.get('customer')).toEqual(
            fromJS({ id: 2, name: 'Receiver customer' }),
        )
        expect(submittedTicket.get('priority')).toBe('urgent')
        expect(submitTicket).toHaveBeenCalledWith(
            submittedTicket,
            'open',
            fromJS([]),
            fromJS({ id: 123 }),
            true,
            'temporary-ticket-id',
        )
        expect(localForageManager.clearTable).toHaveBeenCalledWith(
            'ticket-drafts',
        )
    })

    it('keeps the selected customer when submitting an internal note action macro', async () => {
        const { result } = renderUseNewTicketSubmit(
            defaultArgs,
            buildState({
                appliedMacroActions: [
                    { name: MacroActionName.AddInternalNote },
                ],
            }),
        )

        await submitNewTicket(result)

        expect(submitTicket.mock.calls[0][0].get('customer')).toEqual(
            fromJS({ id: 1, name: 'Original customer' }),
        )
    })

    it('does not submit when a ticket submit is already loading', async () => {
        const { result } = renderUseNewTicketSubmit(
            defaultArgs,
            buildState({ isLoading: true }),
        )

        await submitNewTicket(result)

        expect(submitTicket).not.toHaveBeenCalled()
        expect(localForageManager.clearTable).not.toHaveBeenCalled()
    })

    it('does not clear the draft when submitTicket returns an error', async () => {
        submitTicket.mockReturnValue(async () => ({ error: new Error('Nope') }))

        const { result } = renderUseNewTicketSubmit()

        await submitNewTicket(result)

        expect(submitTicket).toHaveBeenCalled()
        expect(localForageManager.clearTable).not.toHaveBeenCalled()
    })
})
