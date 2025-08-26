import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import GorgiasApi from 'services/gorgiasApi'

import { shopifyDataMappers } from '../Mappings'
import ProductSearchInput from '../ProductSearchInput'

describe('<ProductSearchInput/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <IntegrationContext.Provider
                    value={{ integration: fromJS({}), integrationId: 1 }}
                >
                    <ProductSearchInput
                        dataMappers={shopifyDataMappers}
                        onVariantClicked={_noop}
                    />
                </IntegrationContext.Provider>,
            )

            expect(container).toMatchSnapshot()
        })

        it('should call getKey when search results are rendered', async () => {
            const user = userEvent.setup()
            const getKey = jest.fn((item) => `product-${item.external_id}`)

            const mockSearchResults = [
                {
                    id: 1,
                    integration_id: 1,
                    integration_type: 'shopify',
                    external_id: 'prod_1',
                    item_type: 'product',
                    search: 'Test Product 1',
                    data: {
                        id: 1,
                        title: 'Test Product 1',
                        created_at: '2023-01-01',
                        image: null,
                        images: [],
                        options: [],
                        variants: [
                            {
                                id: 1,
                                admin_graphql_api_id:
                                    'gid://shopify/ProductVariant/1',
                                sku: 'TEST-1',
                                price: '10.00',
                                title: 'Default Title',
                                image_id: null,
                                option1: null,
                                option2: null,
                                option3: null,
                                inventory_quantity: 10,
                                inventory_management: 'shopify',
                                tracked: true,
                            },
                        ],
                    },
                    created_datetime: '2023-01-01T00:00:00Z',
                },
                {
                    id: 2,
                    integration_id: 1,
                    integration_type: 'shopify',
                    external_id: 'prod_2',
                    item_type: 'product',
                    search: 'Test Product 2',
                    data: {
                        id: 2,
                        title: 'Test Product 2',
                        created_at: '2023-01-01',
                        image: null,
                        images: [],
                        options: [],
                        variants: [
                            {
                                id: 2,
                                admin_graphql_api_id:
                                    'gid://shopify/ProductVariant/2',
                                sku: 'TEST-2',
                                price: '20.00',
                                title: 'Default Title',
                                image_id: null,
                                option1: null,
                                option2: null,
                                option3: null,
                                inventory_quantity: 5,
                                inventory_management: 'shopify',
                                tracked: true,
                            },
                        ],
                    },
                    created_datetime: '2023-01-01T00:00:00Z',
                },
            ]

            jest.spyOn(GorgiasApi.prototype, 'search').mockResolvedValue(
                mockSearchResults,
            )

            render(
                <IntegrationContext.Provider
                    value={{ integration: fromJS({}), integrationId: 1 }}
                >
                    <ProductSearchInput
                        getKey={getKey}
                        dataMappers={shopifyDataMappers}
                        onVariantClicked={_noop}
                    />
                </IntegrationContext.Provider>,
            )

            // Find the search input and trigger a search
            const searchInput =
                screen.getByPlaceholderText('Search products...')
            await user.type(searchInput, 'test')

            // Wait for the search results to be rendered
            await waitFor(() => {
                expect(getKey).toHaveBeenCalled()
            })

            expect(getKey).toHaveBeenCalledWith(mockSearchResults[0])
            expect(getKey).toHaveBeenCalledWith(mockSearchResults[1])
        })
    })
})
