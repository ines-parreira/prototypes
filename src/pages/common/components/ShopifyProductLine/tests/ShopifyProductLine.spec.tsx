import {fireEvent, render, waitFor, screen} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {Product} from 'constants/integrations/types/shopify'
import {IntegrationDataItem} from 'models/integration/types'

import {RichFieldEditorPlacement} from 'pages/common/forms/RichField/enums'

import {PRODUCTS_PER_PAGE} from '../../../../../constants/integration'
import {shopifyProductResult} from '../../../../../fixtures/shopify'
import client from '../../../../../models/api/resources'
import ShopifyProductLine from '../ShopifyProductLine'
import css from '../ShopifyProductLine.less'

const minProps = {
    shopifyIntegration: fromJS({
        id: 1,
        name: 'My store',
        domain: 'my-store.com',
    }),
    resetStoreChoice: jest.fn(),
    productClicked: jest.fn(),
    canAddProductAutomations: false,
    productAutomationClicked: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<ShopifyProductLine/>', () => {
    let mockServer: MockAdapter
    let store = mockStore({})
    beforeEach(() => {
        mockServer = new MockAdapter(client)
        store = mockStore({})
    })

    it('should render the product picker', () => {
        const {container} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the product picker with products', async () => {
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: shopifyProductResult()})

        const {container, getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Strong phone/i)).toBeDefined()
            expect(container).toMatchSnapshot()
        })
    })

    it('should render the variants picker of a product', async () => {
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: shopifyProductResult()})

        const {container, getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Black shirt/i)).toBeDefined()
            fireEvent.click(getByText(/Black shirt/i))
            expect(getByText(/781A899/i)).toBeDefined()
            expect(container).toMatchSnapshot()
            fireEvent.click(getByText(/781A899/i))
            expect(minProps.productClicked).toHaveBeenCalled()
        })
    })

    it('should not render the variants picker of a product when it is disabled', async () => {
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: shopifyProductResult()})

        const {container, getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine disableVariantStep={true} {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Black shirt/i)).toBeDefined()
            fireEvent.click(getByText(/Black shirt/i))
            expect(container).toMatchSnapshot()
            expect(minProps.productClicked).toHaveBeenCalled()
        })
    })

    it('should render "{PRODUCTS_PER_PAGE}+ PRODUCTS" count in the variants picker of a product', async () => {
        const shopifyProducts = Array(PRODUCTS_PER_PAGE).fill(
            shopifyProductResult()[0]
        )
        mockServer.onGet('/api/integrations/1/product/').reply(200, {
            data: shopifyProducts,
        })

        const {container, getByText} = render(
            <span className={css.resultTotal}>
                {shopifyProducts.length}
                {shopifyProducts.length >= PRODUCTS_PER_PAGE ? '+' : ''}
                {' PRODUCTS'}
            </span>
        )

        await waitFor(() => {
            expect(
                getByText(PRODUCTS_PER_PAGE.toString() + '+ PRODUCTS')
            ).toBeDefined()
            expect(container).toMatchSnapshot()
        })
    })

    it('should render the product automations', async () => {
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: shopifyProductResult()})

        const {getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine
                    {...minProps}
                    canAddProductAutomations={true}
                />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText('Automations', {exact: false})).toBeInTheDocument()
        })

        getByText('Product Recommendation').click()
        expect(getByText('Similar Browsed Products')).toBeInTheDocument()

        getByText('Back').click()
        expect(getByText('Automations', {exact: false})).toBeInTheDocument()
    })

    it('should render the products header in Convert design', async () => {
        const products = shopifyProductResult()
        mockServer
            .onGet('/api/integrations/1/product/')
            .reply(200, {data: products})

        render(
            <Provider store={store}>
                <ShopifyProductLine
                    {...minProps}
                    placementType={RichFieldEditorPlacement.ConvertDetail}
                />
            </Provider>
        )

        await waitFor(() => {
            expect(
                screen.getByText(`${products.length} Products`, {exact: false})
            ).toBeInTheDocument()
        })

        expect(screen.queryByText('My store')).not.toBeInTheDocument()
    })

    it("should skip product that doesn't have any variant defined", async () => {
        const products = shopifyProductResult() as unknown as Array<
            IntegrationDataItem<Product>
        >
        // Clear variants from the first product
        products[0].data.variants = []

        mockServer.onGet('/api/integrations/1/product/').reply(200, {
            data: products,
        })

        const {getByText, queryByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(
                screen.getByText(`${products.length - 1} Products`, {
                    exact: false,
                })
            ).toBeInTheDocument()

            expect(queryByText(/Black shirt/i)).not.toBeInTheDocument()
            expect(getByText(/Strong phone/i)).toBeDefined()
        })
    })

    it('should call productClicked with the correct variant image URL when a variant is clicked', async () => {
        const shopifyProduct = shopifyProductResult()[0]

        mockServer.onGet('/api/integrations/1/product/').reply(200, {
            data: [shopifyProduct],
        })

        const {getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Black shirt/i)).toBeDefined()
        })

        fireEvent.click(getByText(/Black shirt/i))

        await waitFor(() => {
            expect(getByText(/781A899/i)).toBeDefined()
        })

        fireEvent.click(getByText(/781A899/i))

        await waitFor(() => {
            expect(minProps.productClicked).toHaveBeenCalledWith({
                imageUrl:
                    'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/black-shirt.jpg?v=1626170834',
                price: '25.00',
                link: 'https://undefined/products/?variant=39923189973201',
                productTitle: 'Black shirt',
                variantTitle: ' Size: XL',
                fullProductTitle: 'Black shirt-XL',
                productId: 1,
                variantId: 39923189973201,
            })
        })
    })

    it('should call productClicked with the correct product image URL when a variant is clicked', async () => {
        const shopifyProduct = shopifyProductResult()[0]

        mockServer.onGet('/api/integrations/1/product/').reply(200, {
            data: [shopifyProduct],
        })

        const {getByText} = render(
            <Provider store={store}>
                <ShopifyProductLine {...minProps} />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Black shirt/i)).toBeDefined()
        })

        fireEvent.click(getByText(/Black shirt/i))

        await waitFor(() => {
            expect(getByText(/781A896/i)).toBeDefined()
        })

        fireEvent.click(getByText(/781A896/i))

        await waitFor(() => {
            expect(minProps.productClicked).toHaveBeenCalledWith({
                imageUrl:
                    'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/black-shirt.jpg?v=1626170834',
                price: '25.00',
                link: 'https://undefined/products/?variant=39923189874897',
                productTitle: 'Black shirt',
                variantTitle: ' Size: S',
                fullProductTitle: 'Black shirt-S',
                productId: 1,
                variantId: 39923189874897,
            })
        })
    })
})
