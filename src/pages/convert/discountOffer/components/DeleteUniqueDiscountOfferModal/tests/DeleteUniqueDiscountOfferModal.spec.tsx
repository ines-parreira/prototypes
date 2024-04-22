import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {act, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useDeleteDiscountOffer} from 'models/convert/discountOffer/queries'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useModalManager, useModalManagerApi} from 'hooks/useModalManager'
import {DeleteUniqueDiscountOfferModal} from '../DeleteUniqueDiscountOfferModal'
import {testIds} from '../utils'

jest.mock('models/convert/discountOffer/queries')
jest.mock('hooks/useModalManager')

const useDeleteDiscountOfferMock = assumeMock(useDeleteDiscountOffer)
const useModalManagerMock = assumeMock(useModalManager)

describe('<DeleteUniqueDiscountOfferModal />', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const queryClient = mockQueryClient()
    const store = mockStore({})

    const props = {isOpen: true, onClose: jest.fn()}

    beforeEach(() => {
        useDeleteDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
    })

    it('does not call mutation without params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            const deleteBtn = getByTestId(testIds.deleteBtn)
            deleteBtn.click()
        })

        await waitFor(() => {
            expect(
                useDeleteDiscountOfferMock().mutateAsync
            ).not.toHaveBeenCalled()
        })
    })

    it('calls mutation with the right params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: '1',
            }),
        } as unknown as useModalManagerApi)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            const deleteBtn = getByTestId(testIds.deleteBtn)
            deleteBtn.click()
        })

        await waitFor(() => {
            const title = getByTestId(testIds.title)
            expect(title.textContent).toContain('testPrefix')
            expect(
                useDeleteDiscountOfferMock().mutateAsync
            ).toHaveBeenCalledWith([undefined, {discount_offer_id: '1'}])
        })
    })

    it('closes modal on Back button', async () => {
        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DeleteUniqueDiscountOfferModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            const backBtn = getByTestId(testIds.backBtn)
            backBtn.click()
        })

        await waitFor(() => {
            expect(props.onClose).toHaveBeenCalled()
        })
    })
})
