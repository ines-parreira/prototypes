import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import client from 'models/api/resources'
import {
    useCollectionsFromShopifyIntegration,
    useListShopifyCustomerSegments,
    useProductsFromShopifyIntegration,
} from 'models/integration/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import DiscountCodeCreateModal from '../DiscountCodeCreateModal'
import { setupValidModalParameters } from '../utils'

jest.mock('models/integration/queries')

const useListShopifyCustomerSegmentsMock = assumeMock(
    useListShopifyCustomerSegments,
)
const useCollectionsFromShopifyIntegrationMock = assumeMock(
    useCollectionsFromShopifyIntegration,
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

const minProps = {
    integration: fromJS(integrationsState.integration),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
}

const mockedServer = new MockAdapter(client)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()
// const useModalManagerMock = assumeMock(useModalManager)

describe('<DiscountCodeCreateModal />', () => {
    const store = mockStore({})

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
        mockedServer
            .onPost(`/api/discount-codes/${integrationsState.integration.id}/`)
            .reply(200, {})

        useListShopifyCustomerSegmentsMock.mockReturnValue({
            data: [VALID_SEGMENT_1, VALID_SEGMENT_2],
            object: 'list',
            uri: '/integrations/shopify/5007/segments/?',
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        } as any)
        useCollectionsFromShopifyIntegrationMock.mockReturnValue({
            data: [VALID_PRODUCT_COLLECTION_1, VALID_PRODUCT_COLLECTION_2],
        } as any)
        useProductsFromShopifyIntegrationMock.mockReturnValue({
            data: [VALID_PRODUCT_1, VALID_PRODUCT_2],
        } as any)
    })

    afterEach(() => {
        jest.useRealTimers()
        mockedServer.reset()
    })

    it('creates a new discount', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toEqual(
            '{"starts_at":"2024-01-01T00:00:00.000Z","discount_type":"percentage","title":null,"code":"MYCODE","discount_value":0.2,"once_per_customer":false,"usage_limit":null,"minimum_purchase_amount":199,"segment_ids":null,"product_ids":null,"collection_ids":null}',
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('creates a new discount with multiple segments', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

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

        // Delete, check and readd the first segment
        userEvent.click(validSegmentSample)
        expect(inputElement.textContent).toBe(VALID_SEGMENT_2.name)
        userEvent.click(validSegmentSample)

        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"segment_ids":["${VALID_SEGMENT_2.id}","${VALID_SEGMENT_1.id}"]`,
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('creates a new discount with multiple collections', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
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

        // Selects the first segment
        userEvent.click(validCollectionSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_COLLECTION_1.title)

        // Selects the second segment
        userEvent.click(validCollectionSample2)
        expect(inputElement.textContent).toBe('2 collections selected')

        // Delete, check and readd the first segment
        userEvent.click(validCollectionSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_COLLECTION_2.title)
        userEvent.click(validCollectionSample)

        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"collection_ids":["${VALID_PRODUCT_COLLECTION_2.id}","${VALID_PRODUCT_COLLECTION_1.id}"]`,
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('creates a new discount selecting collections and moving back to total order amount', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
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

        // Selects the first segment
        userEvent.click(validCollectionSample)
        expect(inputElement.textContent).toBe(VALID_PRODUCT_COLLECTION_1.title)

        // Selects the second segment
        userEvent.click(validCollectionSample2)
        expect(inputElement.textContent).toBe('2 collections selected')

        // Move back to total order amount
        screen.getByText('Total order amount').click()

        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"collection_ids":null`,
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('selects some collections then switches to free shipping and collections are not sent', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

        screen.getByText('To specific collection').click()
        const inputElement = screen.getByText('Select a product collection')
        fireEvent.focus(inputElement)

        // Select 2 collections
        const validCollectionSample = screen.getByText(
            VALID_PRODUCT_COLLECTION_1.title,
        )
        const validCollectionSample2 = screen.getByText(
            VALID_PRODUCT_COLLECTION_2.title,
        )
        userEvent.click(validCollectionSample)
        userEvent.click(validCollectionSample2)
        expect(inputElement.textContent).toBe('2 collections selected')

        // Move back to free shipping
        screen.getByText('Free shipping').click()

        // Saves
        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"collection_ids":null`,
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('creates a new discount with multiple products', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
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
        act(() => userEvent.click(validProductSample))
        expect(inputElement.textContent).toBe(VALID_PRODUCT_1.data.title)

        // Selects the second product
        act(() => userEvent.click(validProductSample2))
        expect(inputElement.textContent).toBe('2 products selected')

        // Delete, check and re-add the first product
        act(() => userEvent.click(validProductSample))
        expect(inputElement.textContent).toBe(VALID_PRODUCT_2.data.title)
        act(() => userEvent.click(validProductSample))

        act(() => screen.getByText('Save').click())

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"product_ids":["${VALID_PRODUCT_2.data.id}","${VALID_PRODUCT_1.data.id}"]`,
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('creates a new discount selecting products and moving back to total order amount', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
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

        // Move back to total order amount
        screen.getByText('Total order amount').click()

        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"product_ids":null`,
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('selects some products then switches to free shipping and products are not sent', async () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )

        await setupValidModalParameters()

        act(() => screen.getByText('To specific products').click())
        const inputElement = screen.getByText('Select specific products')
        fireEvent.focus(inputElement)

        const validProductSample = screen.getByText(VALID_PRODUCT_1.data.title)
        const validProductSample2 = screen.getByText(VALID_PRODUCT_2.data.title)
        act(() => userEvent.click(validProductSample))
        act(() => userEvent.click(validProductSample2))
        expect(inputElement.textContent).toBe('2 products selected')

        // Move back to free shipping
        screen.getByText('Free shipping').click()

        // Saves
        screen.getByText('Save').click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"product_ids":null`,
        )
    })
})
