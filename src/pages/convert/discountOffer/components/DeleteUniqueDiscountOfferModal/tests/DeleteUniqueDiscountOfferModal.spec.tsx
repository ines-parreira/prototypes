import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore, { MockStore } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useModalManager, useModalManagerApi } from 'hooks/useModalManager'
import { useDeleteDiscountOffer } from 'models/convert/discountOffer/queries'
import { deleteAttachment } from 'state/newMessage/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { DeleteUniqueDiscountOfferModal } from '../DeleteUniqueDiscountOfferModal'

jest.mock('models/convert/discountOffer/queries')
jest.mock('hooks/useModalManager')
jest.mock('state/newMessage/actions')
jest.mock('hooks/useAppDispatch')

const useDeleteDiscountOfferMock = assumeMock(useDeleteDiscountOffer)
const useModalManagerMock = assumeMock(useModalManager)
const deleteAttachmentMock = assumeMock(deleteAttachment)

describe('<DeleteUniqueDiscountOfferModal />', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const queryClient = mockQueryClient()
    let store: MockStore

    const props = { isOpen: true, onClose: jest.fn() }

    beforeEach(() => {
        store = mockStore({
            newMessage: fromJS({
                newMessage: {
                    attachments: [
                        {
                            content_type: 'application/discountOffer',
                            extra: { discount_offer_id: '1' },
                        },
                    ],
                },
            }),
        })

        deleteAttachmentMock.mockReturnValue({
            type: '',
            index: 5,
        })

        useDeleteDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
    })

    it('does not call mutation without params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            const deleteBtn = screen.getByText('Delete Code')
            deleteBtn.click()
        })

        await waitFor(() => {
            expect(
                useDeleteDiscountOfferMock().mutateAsync,
            ).not.toHaveBeenCalled()
        })
    })

    it('calls mutation with the right params and deletes current attachment', async () => {
        const mockPrefix = 'testPrefix'
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: mockPrefix,
                id: '1',
            }),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            const deleteBtn = screen.getByText('Delete Code')
            deleteBtn.click()
        })

        await waitFor(() => {
            expect(screen.getByText(new RegExp(mockPrefix))).toBeInTheDocument()
            expect(
                useDeleteDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([undefined, { discount_offer_id: '1' }])
            expect(deleteAttachmentMock).toHaveBeenCalledWith(0)
        })
    })
    it('calls mutation with the right params and does not delete current attachment', async () => {
        const mockPrefix = 'testPrefix'
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: mockPrefix,
                id: '5',
            }),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            const deleteBtn = screen.getByText('Delete Code')
            deleteBtn.click()
        })

        await waitFor(() => {
            expect(screen.getByText(new RegExp(mockPrefix))).toBeInTheDocument()
            expect(
                useDeleteDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([undefined, { discount_offer_id: '5' }])
            expect(deleteAttachmentMock).not.toHaveBeenCalled()
        })
    })

    it('closes modal on Back button', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            const backBtn = screen.getByText('Back')
            backBtn.click()
        })

        await waitFor(() => {
            expect(props.onClose).toHaveBeenCalled()
        })
    })
})
