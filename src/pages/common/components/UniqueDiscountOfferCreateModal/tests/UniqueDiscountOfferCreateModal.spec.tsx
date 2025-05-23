import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import { useModalManager, useModalManagerApi } from 'hooks/useModalManager'
import {
    useCreateDiscountOffer,
    useUpdateDiscountOffer,
} from 'models/convert/discountOffer/queries'
import {
    useCollectionsFromShopifyIntegration,
    useListShopifyCustomerSegments,
    useProductsFromShopifyIntegration,
} from 'models/integration/queries'
import { setupValidModalParameters } from 'pages/common/components/UniqueDiscountOfferCreateModal/utils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import {
    UniqueDiscountOfferCreateModal,
    UniqueDiscountOfferCreateModalProps,
} from '../UniqueDiscountOfferCreateModal'

jest.mock('models/integration/queries')
jest.mock('models/convert/discountOffer/queries')
jest.mock('hooks/useModalManager')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()
const store = mockStore({})

const useCreateDiscountOfferMock = assumeMock(useCreateDiscountOffer)
const useUpdateDiscountOffersMock = assumeMock(useUpdateDiscountOffer)
const useModalManagerMock = assumeMock(useModalManager)
const useCollectionsFromShopifyIntegrationMock = assumeMock(
    useCollectionsFromShopifyIntegration,
)
const useListShopifyCustomerSegmentsMock = assumeMock(
    useListShopifyCustomerSegments,
)
const useProductsFromShopifyIntegrationMock = assumeMock(
    useProductsFromShopifyIntegration,
)

const VALID_SEGMENT_1 = {
    id: 1069404225875,
    name: 'Customers who have purchased at least once',
    admin_graphql_api_id: 'gid://shopify/Segment/1069404225875',
}
const VALID_SEGMENT_2 = {
    id: 1069404193107,
    name: 'Email subscribers',
    admin_graphql_api_id: 'gid://shopify/Segment/1069404193107',
}
const VALID_PRODUCT_COLLECTION_1 = {
    id: 1,
    title: 'Lorem Ipsum',
}
const VALID_PRODUCT_COLLECTION_2 = {
    id: 2,
    title: 'Nike',
}
const VALID_PRODUCT_1 = {
    data: { title: 'Product 1', id: '1' },
}
const VALID_PRODUCT_2 = { data: { title: 'Product 2', id: '2' } }

describe('<UniqueDiscountOfferCreateModal />', () => {
    const props: UniqueDiscountOfferCreateModalProps = {
        isOpen: true,
        onClose: jest.fn(),
        integration: fromJS({
            ...integrationsState.integration,
            oauth: {
                scope: ['read_discounts', 'write_discounts'],
            },
        }),
        onSubmit: jest.fn(),
    }

    beforeEach(() => {
        useCreateDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
        useUpdateDiscountOffersMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)

        useCollectionsFromShopifyIntegrationMock.mockReturnValue({
            data: [VALID_PRODUCT_COLLECTION_1, VALID_PRODUCT_COLLECTION_2],
        } as any)
        useListShopifyCustomerSegmentsMock.mockReturnValue({
            data: [VALID_SEGMENT_1, VALID_SEGMENT_2],
            object: 'list',
            uri: '/integrations/shopify/5007/segments/?',
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        } as any)
        useProductsFromShopifyIntegrationMock.mockReturnValue({
            data: [VALID_PRODUCT_1, VALID_PRODUCT_2],
        } as any)
    })

    it('opens in create mode event if collections is not returned', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        useCollectionsFromShopifyIntegrationMock.mockReturnValue({} as any)
        useListShopifyCustomerSegmentsMock.mockReturnValue([] as any)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText(/Create a new discount offer/),
            ).toBeInTheDocument()
            const prefixInput = screen.getByLabelText(/Unique code prefix/)
            expect(prefixInput).toHaveValue('')
            expect(screen.getByText(/Save/)).toBeInTheDocument()
        })
    })

    it('opens in create mode if there is no params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText(/Create a new discount offer/),
            ).toBeInTheDocument()
            const prefixInput = screen.getByLabelText(/Unique code prefix/)
            expect(prefixInput).toHaveValue('')
            expect(screen.getByText(/Save/)).toBeInTheDocument()
        })
    })

    it('opens in edit mode if there is offer params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
            }),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText(/Edit discount offer/)).toBeInTheDocument()
            const prefixInput = screen.getByLabelText(/Unique code prefix/)
            expect(prefixInput).toHaveValue('testPrefix')
            const saveBtn = screen.getByText(/Save/)
            expect(saveBtn.textContent).toContain('Save Changes')
            expect(saveBtn).toBeAriaEnabled()
        })
    })

    it('opens in edit mode with `applies to` visible', () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
                external_collection_ids: ['1'],
            }),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByLabelText('Applies to')).toBeInTheDocument()

        const inputElement = screen.getByText('Select a product collection')
        fireEvent.focus(inputElement)

        expect(screen.getByText('Lorem Ipsum')).toBeVisible()
    })

    it('opens in edit mode and select applies to', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        const prefixInput = screen.getByLabelText(/Unique code prefix/)
        await userEvent.type(prefixInput, 'TEST')

        const discountValueInput = screen.getByLabelText('Discount value')
        await userEvent.type(discountValueInput, '1')

        userEvent.click(screen.getByLabelText('Applies to'))
        userEvent.click(screen.getByText('To specific collection'))
        const inputElement = screen.getByText('Select a product collection')
        fireEvent.focus(inputElement)
        fireEvent.click(screen.getByText(/Lorem Ipsum/))

        const saveBtn = screen.getByText(/Save/)
        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    prefix: 'TEST',
                    type: 'fixed',
                    value: 1,
                    external_collection_ids: ['1'],
                }),
            ])
        })
    })

    it('creates a new discount offer', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )
        const expected = {
            type: 'percentage',
            prefix: 'hello',
            value: 20,
            minimum_purchase_amount: 199,
        }

        // setup
        const prefixInput = screen.getByLabelText(/Unique code prefix/)

        const discountTypeSelect = screen.getByLabelText('Discount')
        const discountValueInput = screen.getByLabelText('Discount value')
        const minRequirementsRadio = screen.getByLabelText(
            'Minimum purchase amount',
        )
        const noMinRequirementsRadio = screen.getByLabelText(
            'No minimum requirements',
        )

        const saveBtn = screen.getByText(/Save/)

        userEvent.click(discountTypeSelect)

        userEvent.click(screen.getByRole('menuitem', { name: 'Percentage' }))

        // set discount value to invalid
        await userEvent.type(discountValueInput, '200')

        // set discount min amount
        userEvent.click(noMinRequirementsRadio)
        userEvent.click(minRequirementsRadio)
        const minPurchaseAmountInput = screen.getByLabelText(
            'Minimum purchase amount value',
        )
        userEvent.clear(minPurchaseAmountInput)
        await userEvent.type(
            minPurchaseAmountInput,
            expected.minimum_purchase_amount.toString(),
        )

        // press save with invalid fields
        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).not.toHaveBeenCalled()
        })

        // fix empty prefix
        await userEvent.type(prefixInput, expected.prefix)

        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).not.toHaveBeenCalled()
        })

        // fix max percentage
        userEvent.clear(discountValueInput)
        await userEvent.type(discountValueInput, expected.value.toString())

        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    ...expected,
                }),
            ])
        })
    })

    it('allows saving without selected customer segments', async () => {
        // Setup
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

        // Default value, nothing selected
        screen.getByText('All customers')

        const saveBtn = screen.getByText(/Save/)

        // Saves without segments
        saveBtn.click()
        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    external_customer_segment_ids: null,
                }),
            ])
        })
    })

    it('allows saving with multiple values for customer segment', async () => {
        // Setup
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

        // Select specific collections
        const inputElement = screen.getByText('All customers')
        fireEvent.focus(inputElement)
        const validSegmentSample = screen.getByText(VALID_SEGMENT_1.name)
        const validSegmentSample2 = screen.getByText(VALID_SEGMENT_2.name)

        // Selects the first segment
        userEvent.click(validSegmentSample)
        expect(inputElement.textContent).toBe(VALID_SEGMENT_1.name)

        // Selects the second segment
        userEvent.click(validSegmentSample2)
        expect(inputElement.textContent).toBe('2 segments selected')

        // Delete one of the segments, check and add again
        userEvent.click(validSegmentSample)
        expect(inputElement.textContent).toBe(VALID_SEGMENT_2.name)
        userEvent.click(validSegmentSample)

        const saveBtn = screen.getByText(/Save/)

        // Saves with two segments
        saveBtn.click()
        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    external_customer_segment_ids: [
                        VALID_SEGMENT_2.id.toString(),
                        VALID_SEGMENT_1.id.toString(),
                    ],
                }),
            ])
        })
    })

    it('allows saving without values for product collections', async () => {
        // Setup
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()
        screen.getByText('To specific collection').click()

        // This grants the initial status
        screen.getByText('Select a product collection')

        const saveBtn = screen.getByText(/Save/)

        // Saves without collections
        saveBtn.click()
        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    external_collection_ids: null,
                }),
            ])
        })
    })

    it('allows saving with multiple values for product collections', async () => {
        // Setup
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()
        screen.getByText('To specific collection').click()

        const inputElement = screen.getByText('Select a product collection')
        fireEvent.focus(inputElement)

        const validCollectionSample = screen.getByText(
            VALID_PRODUCT_COLLECTION_1.title,
        )
        const validCollectionSample2 = screen.getByText(
            VALID_PRODUCT_COLLECTION_2.title,
        )

        // Selects the first collection
        userEvent.click(validCollectionSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_COLLECTION_1.title)

        // Selects the second collection
        userEvent.click(validCollectionSample2)
        expect(inputElement.textContent).toBe('2 collections selected')

        // Delete one of the collections, check, delete again, check add both
        userEvent.click(validCollectionSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_COLLECTION_2.title)
        // Deleting both tests the label for a list of 0 collections
        userEvent.click(validCollectionSample2)
        expect(inputElement.textContent).toBe('Select a product collection')
        userEvent.click(validCollectionSample)
        userEvent.click(validCollectionSample2)

        const saveBtn = screen.getByText(/Save/)

        // Saves with two collections
        saveBtn.click()
        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    external_collection_ids: [
                        VALID_PRODUCT_COLLECTION_1.id.toString(),
                        VALID_PRODUCT_COLLECTION_2.id.toString(),
                    ],
                }),
            ])
        })
    })

    it('updates an existing offer if modal is in edit mode', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
                minimum_purchase_amount: null,
                store_integration_id: '3',
            }),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        const prefixInput = screen.getByLabelText(/Unique code prefix/)
        const saveBtn = screen.getByText(/Save/)

        userEvent.clear(prefixInput)
        await userEvent.type(prefixInput, 'discount')

        saveBtn.click()

        await waitFor(() => {
            expect(saveBtn.textContent).toContain('Save Changes')
            expect(saveBtn).toBeAriaEnabled()
            expect(
                useUpdateDiscountOffersMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                { discount_offer_id: 'testId' },
                expect.objectContaining({
                    prefix: 'discount',
                }),
            ])
        })
    })

    it('updates an existing offer - changing applies to', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
                minimum_purchase_amount: null,
                store_integration_id: '3',
                external_collection_ids: ['1'],
            }),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        userEvent.click(screen.getByLabelText('Applies to'))
        userEvent.click(screen.getByText('Total order amount'))

        const saveBtn = screen.getByText(/Save/)

        saveBtn.click()

        await waitFor(() => {
            expect(saveBtn.textContent).toContain('Save Changes')
            expect(saveBtn).toBeAriaEnabled()
            expect(
                useUpdateDiscountOffersMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                { discount_offer_id: 'testId' },
                expect.objectContaining({
                    external_collection_ids: null,
                }),
            ])
        })
    })

    it('allows saving with multiple values for product collections', async () => {
        // Setup
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()
        screen.getByText('To specific collection').click()

        const inputElement = screen.getByText('Select a product collection')
        fireEvent.focus(inputElement)

        const validCollectionSample = screen.getByText(
            VALID_PRODUCT_COLLECTION_1.title,
        )
        const validCollectionSample2 = screen.getByText(
            VALID_PRODUCT_COLLECTION_2.title,
        )

        // Selects the first collection
        userEvent.click(validCollectionSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_COLLECTION_1.title)

        // Selects the second collection
        userEvent.click(validCollectionSample2)
        expect(inputElement.textContent).toBe('2 collections selected')

        // Save
        screen.getByText(/Save/).click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    external_collection_ids: [
                        VALID_PRODUCT_COLLECTION_1.id.toString(),
                        VALID_PRODUCT_COLLECTION_2.id.toString(),
                    ],
                }),
            ])
        })
    })

    it('allows saving with multiple values for multiple products', async () => {
        // Setup
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

        act(() => screen.getByText('To specific products').click())
        const inputElement = screen.getByText('Select specific products')
        fireEvent.focus(inputElement)

        const validProductSample = screen.getByText(VALID_PRODUCT_1.data.title)
        const validProductSample2 = screen.getByText(VALID_PRODUCT_2.data.title)

        // Selects the first product
        userEvent.click(validProductSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_1.data.title)

        // Selects the second product
        userEvent.click(validProductSample2)
        expect(inputElement.textContent).toBe('2 products selected')

        // Remove one of the products and re-add it
        act(() => userEvent.click(validProductSample))
        expect(inputElement.textContent).toBe(VALID_PRODUCT_2.data.title)
        act(() => userEvent.click(validProductSample))

        // Save
        screen.getByText(/Save/).click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync,
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    external_product_ids: [
                        VALID_PRODUCT_2.data.id,
                        VALID_PRODUCT_1.data.id,
                    ],
                }),
            ])
        })
    })
})
