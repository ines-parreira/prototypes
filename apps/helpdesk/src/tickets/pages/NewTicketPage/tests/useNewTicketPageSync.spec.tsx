import type { ComponentType } from 'react'
import type React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState, StoreDispatch } from 'state/types'

import { useNewTicketPageSync } from '../hooks/useNewTicketPageSync'

jest.mock('state/ticket/actions', () => ({
    ...jest.requireActual('state/ticket/actions'),
    clearTicket: jest.fn(() => ({ type: 'CLEAR_TICKET_MOCK' })),
}))

jest.mock('state/newMessage/actions', () => ({
    ...jest.requireActual('state/newMessage/actions'),
    initializeMessageDraft: jest.fn(() => () => ({
        type: 'INITIALIZE_MESSAGE_DRAFT_MOCK',
    })),
}))

const { clearTicket } = jest.requireMock<typeof import('state/ticket/actions')>(
    'state/ticket/actions',
)

const { initializeMessageDraft } = jest.requireMock<
    typeof import('state/newMessage/actions')
>('state/newMessage/actions')

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    newMessage: fromJS({
        newMessage: {
            attachments: [],
            body_html: '',
            body_text: '',
            source: { type: 'email', to: [] },
            public: true,
        },
    }),
    ticket: fromJS({
        subject: '',
        tags: [],
        state: { appliedMacro: null },
    }),
} as unknown as RootState

describe('useNewTicketPageSync', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    const createWrapper = (store: ReturnType<typeof mockStore>) =>
        (({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )) as unknown as ComponentType

    it('dispatches clearTicket on mount', () => {
        const store = mockStore(defaultState)

        renderHook(() => useNewTicketPageSync(), {
            wrapper: createWrapper(store),
        })

        expect(clearTicket).toHaveBeenCalledTimes(1)
    })

    it('dispatches initializeMessageDraft after a 1ms delay', () => {
        const store = mockStore(defaultState)

        renderHook(() => useNewTicketPageSync(), {
            wrapper: createWrapper(store),
        })

        expect(initializeMessageDraft).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1)

        expect(initializeMessageDraft).toHaveBeenCalledTimes(1)
    })

    it('dispatches clearTicket on unmount', () => {
        const store = mockStore(defaultState)

        const { unmount } = renderHook(() => useNewTicketPageSync(), {
            wrapper: createWrapper(store),
        })

        jest.clearAllMocks()
        unmount()

        expect(clearTicket).toHaveBeenCalledTimes(1)
    })

    it('clears the timeout on unmount so initializeMessageDraft does not fire', () => {
        const store = mockStore(defaultState)

        const { unmount } = renderHook(() => useNewTicketPageSync(), {
            wrapper: createWrapper(store),
        })

        unmount()
        jest.clearAllMocks()

        jest.advanceTimersByTime(10)

        expect(initializeMessageDraft).not.toHaveBeenCalled()
    })
})
