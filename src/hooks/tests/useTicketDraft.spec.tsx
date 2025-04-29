import React, { ComponentType } from 'react'

import { waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import LocalForageManager from 'services/localForageManager/localForageManager'
import { RootState, StoreDispatch } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

import useTicketDraft from '../useTicketDraft'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const mockSetItem = jest.fn()
const mockGetItem = jest.fn()
const mockGetTableObject = {
    getItem: mockGetItem,
    setItem: mockSetItem,
} as unknown as LocalForage

const defaultTicket = {
    subject: '',
    tags: [],
    state: {
        appliedMacro: null,
    },
}

const defaultState = {
    newMessage: fromJS({
        newMessage: {
            attachments: [],
            body_html: '',
            body_text: '',
            source: {},
        },
    }),
    ticket: fromJS(defaultTicket),
} as RootState

describe('useTicketDraft hook', () => {
    it('should not save draft when ticket is not new', () => {
        renderHook(() => useTicketDraft(false))
        expect(mockSetItem).not.toHaveBeenCalled()
    })

    it('should save draft when ticket is new, draft does not exist yet and new ticket state is not empty', async () => {
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(
            mockGetTableObject,
        )

        renderHook(() => useTicketDraft(true), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            )) as unknown as ComponentType,
        })

        await waitFor(() => {
            expect(mockSetItem).toHaveBeenCalled()
        })
    })

    it('should save draft when ticket is new, a draft exists and new ticket state is not empty', async () => {
        mockGetItem.mockResolvedValue(true)
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(
            mockGetTableObject,
        )

        renderHook(() => useTicketDraft(true), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            )) as unknown as ComponentType,
        })

        await waitFor(() => {
            expect(mockSetItem).toHaveBeenCalled()
        })
    })

    it('should save draft when ticket is new, ticket form is filled then emptied', async () => {
        mockGetItem.mockResolvedValue(true)
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(
            mockGetTableObject,
        )

        const wrapper = (({
            children,
            ticket,
        }: {
            children: React.ReactNode
            ticket: Map<any, any>
        }) => (
            <Provider store={mockStore({ ...defaultState, ticket })}>
                {children}
            </Provider>
        )) as unknown as ComponentType

        const { rerender } = renderHook(() => useTicketDraft(true), {
            wrapper,
            initialProps: {
                ticket: fromJS({
                    ...defaultTicket,
                    subject: '',
                    tags: [{ name: 'during-business-hours' }],
                }),
            },
        })

        rerender({ ticket: defaultState.ticket })

        await waitFor(() => {
            expect(mockSetItem).toHaveBeenCalledTimes(2)
        })
    })
})
