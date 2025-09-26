import React, { ComponentType } from 'react'

import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { ContentState, convertToRaw } from 'draft-js'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import LocalForageManager from 'services/localForageManager/localForageManager'
import { RootState, StoreDispatch } from 'state/types'

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
        renderHook(() => useTicketDraft(false), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            )) as unknown as ComponentType,
        })
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

        const filledTicket = fromJS({
            ...defaultTicket,
            subject: '',
            tags: [{ name: 'during-business-hours' }],
        })

        const emptyTicket = fromJS({
            ...defaultTicket,
            tags: [],
        })

        let currentTicket = filledTicket

        const wrapper = ({ children }: { children: React.ReactNode }) => {
            const store = mockStore({
                ...defaultState,
                ticket: currentTicket,
            })
            return <Provider store={store}>{children}</Provider>
        }

        const { rerender } = renderHook(() => useTicketDraft(true), {
            wrapper,
        })

        await waitFor(() => {
            expect(mockSetItem).toHaveBeenCalledTimes(1)
        })

        // Update ticket to empty
        currentTicket = emptyTicket
        rerender()

        await waitFor(() => {
            expect(mockSetItem).toHaveBeenCalledTimes(2)
        })
    })

    it('should persist originalContentState when saving draft with translation', async () => {
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(
            mockGetTableObject,
        )

        const originalContent = ContentState.createFromText('Original text')
        const translatedContent = ContentState.createFromText('Translated text')

        const stateWithTranslation = {
            ...defaultState,
            newMessage: fromJS({
                state: {
                    contentState: translatedContent,
                    originalContentState: originalContent,
                },
                newMessage: {
                    attachments: [],
                    body_html: '<p>Translated text</p>',
                    body_text: 'Translated text',
                    source: {},
                },
            }),
        } as RootState

        renderHook(() => useTicketDraft(true), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <Provider store={mockStore(stateWithTranslation)}>
                    {children}
                </Provider>
            )) as unknown as ComponentType,
        })

        await waitFor(() => {
            expect(mockSetItem).toHaveBeenCalledWith(
                'new',
                expect.objectContaining({
                    ticket: expect.objectContaining({
                        contentState: convertToRaw(translatedContent),
                        originalContentState: convertToRaw(originalContent),
                    }),
                }),
            )
        })
    })
})
