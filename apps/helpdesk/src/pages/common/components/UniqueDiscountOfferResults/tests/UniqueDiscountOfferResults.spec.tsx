import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import { uniqueDiscountOffers } from 'fixtures/uniqueDiscountOffers'
import { useModalManager } from 'hooks/useModalManager'
import {
    useCreateDiscountOffer,
    useDeleteDiscountOffer,
    useListDiscountOffers,
    useUpdateDiscountOffer,
} from 'models/convert/discountOffer/queries'
import {
    DELETE_DISCOUNT_MODAL_NAME,
    UNIQUE_DISCOUNT_MODAL_NAME,
} from 'models/discountCodes/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import UniqueDiscountCodeResults from '../UniqueDiscountOfferResults'

jest.mock('models/convert/discountOffer/queries')
jest.mock('hooks/useModalManager')

const minProps = {
    integration: fromJS({
        ...integrationsState.integration,
        meta: {
            ...integrationsState.integration.meta,
            oauth: {
                scope: ['read_discounts', 'write_discounts'],
            },
        },
    }),
    canAddUniqueDiscountOffer: true,
    onDiscountSelected: jest.fn(),
    onResetStoreChoice: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()
const store = mockStore({})

const useListDiscountOffersMock = assumeMock(useListDiscountOffers)
const useDeleteDiscountOfferMock = assumeMock(useDeleteDiscountOffer)
const useCreateDiscountOfferMock = assumeMock(useCreateDiscountOffer)
const useUpdateDiscountOffersMock = assumeMock(useUpdateDiscountOffer)
const useModalManagerMock = assumeMock(useModalManager)

describe('<DiscountCodeResults />', () => {
    beforeEach(() => {
        useDeleteDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)

        useCreateDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)

        useUpdateDiscountOffersMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
        useModalManagerMock.mockReturnValue({
            isOpen: () => false,
            getParams: jest.fn(),
            openModal: jest.fn(),
        } as any)
    })

    afterEach(() => {
        useListDiscountOffersMock.mockRestore()
        useDeleteDiscountOfferMock.mockRestore()
        useCreateDiscountOfferMock.mockRestore()
        useUpdateDiscountOffersMock.mockRestore()
    })

    it('should render the discount codes', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: uniqueDiscountOffers,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        const { getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(getByText(/CODE1/i)).toBeDefined()
        })
    })

    it('should render no results', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        const { getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(getByText(/Start by creating a code offer/i)).toBeDefined()
        })
    })

    it('should open delete modal on intent', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: uniqueDiscountOffers,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        const deleteIntentBtn = screen.getByLabelText('Delete discount offer')

        userEvent.click(deleteIntentBtn)

        await waitFor(() => {
            expect(useModalManagerMock().openModal).toHaveBeenCalledWith(
                DELETE_DISCOUNT_MODAL_NAME,
                undefined,
                expect.objectContaining({ ...uniqueDiscountOffers[0] }),
            )
        })
    })
    it('should open edit modal on intent', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: uniqueDiscountOffers,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        const editBtn = screen.getByLabelText('Edit discount offer')

        userEvent.click(editBtn)

        await waitFor(() => {
            expect(useModalManagerMock().openModal).toHaveBeenCalledWith(
                UNIQUE_DISCOUNT_MODAL_NAME,
                undefined,
                expect.objectContaining({ ...uniqueDiscountOffers[0] }),
            )
        })
    })
    it('should add offer on discount click', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: uniqueDiscountOffers,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        const discount = screen.getByText(uniqueDiscountOffers[0].prefix)
        userEvent.click(discount)

        await waitFor(() => {
            expect(minProps.onDiscountSelected).toHaveBeenCalledWith(
                uniqueDiscountOffers[0],
            )
        })
    })
    it('should not add offer on discount click if canAddUniqueDiscountOffer is false', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: uniqueDiscountOffers,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults
                        {...minProps}
                        canAddUniqueDiscountOffer={false}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const discount = screen.getByText(uniqueDiscountOffers[0].prefix)

        userEvent.click(discount)

        await waitFor(() => {
            expect(minProps.onDiscountSelected).not.toHaveBeenCalled()
        })
    })
})
