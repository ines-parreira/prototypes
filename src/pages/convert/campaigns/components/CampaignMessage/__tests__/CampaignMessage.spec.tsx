import React from 'react'
import {fromJS, Map} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render, act} from '@testing-library/react'

import {
    InventoryManagement as ShipifyInventoryManagement,
    InventoryPolicy as ShipifyInventoryPolicy,
} from 'constants/integrations/types/shopify'
import {ShopifyIntegration} from 'models/integration/types'

import {shopifyProductFixture, shopifyVariantFixture} from 'fixtures/shopify'
import {RootState, StoreDispatch} from 'state/types'
import {flushPromises} from 'utils/testing'

import * as integrationHook from 'pages/convert/campaigns/containers/IntegrationProvider'
import * as integrationHelpers from 'state/integrations/helpers'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {CampaignMessage} from '../CampaignMessage'

jest.mock('pages/common/forms/RichField/RichFieldEditor')

const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {
    integrations: fromJS({integrations: []}),
} as RootState

const attachments = [
    {
        content_type: 'application/productCard',
        name: 'The Out of Stock Snowboard',
        size: 0,
        url: 'https://cdn.shopify.com/',
        extra: {
            product_id: 1,
            product_link:
                'https://shop-name.myshopify.com/products/product-name',
            price: 885.95,
            featured_image: 'https://cdn.shopify.com/',
        },
    },
]

describe('<CampaignMessage>', () => {
    window.IMAGE_PROXY_URL = 'http://proxy-url/'
    window.IMAGE_PROXY_SIGN_KEY = 'test-key'

    describe('is not convert subscriber', () => {
        beforeEach(() => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => false)
        })

        it('renders the warning if the content is too big and merchant is a revenue subscriber', () => {
            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <CampaignMessage
                        showContentWarning
                        isConvertSubscriber
                        richAreaRef={jest.fn()}
                        agents={[]}
                        html=""
                        text=""
                        selectedAgent=""
                        onSelectAgent={jest.fn()}
                        onChangeMessage={jest.fn()}
                        onDeleteAttachment={jest.fn()}
                    />
                </Provider>
            )

            expect(
                getByText(
                    'Your campaign might be too large for mobile devices or small screens. We advise limiting the content to maximum 170 characters and maximum 5 lines of text.'
                )
            ).toBeInTheDocument()
        })

        it('does not render the warning if the content is too big and merchant is not a revenue subscriber', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <CampaignMessage
                        showContentWarning
                        isConvertSubscriber={false}
                        richAreaRef={jest.fn()}
                        agents={[]}
                        html=""
                        text=""
                        selectedAgent=""
                        onSelectAgent={jest.fn()}
                        onChangeMessage={jest.fn()}
                        onDeleteAttachment={jest.fn()}
                    />
                </Provider>
            )

            expect(
                queryByText(
                    'Your campaign might be too large for mobile devices or small screens. We advise limiting the content to maximum 170 characters and maximum 5 lines of text.'
                )
            ).toBeNull()
        })
    })

    describe('is convert subscriber', () => {
        beforeEach(() => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => true)

            jest.spyOn(
                integrationHook,
                'useIntegrationContext'
            ).mockImplementation(() => ({
                shopifyIntegration: {
                    id: 1,
                } as ShopifyIntegration,
            }))
        })

        it('it displays out of stock warning banner', async () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Deny,
            })
            const product = shopifyProductFixture({variants: [variant]})

            jest.spyOn(
                integrationHelpers,
                'fetchIntegrationProducts'
            ).mockReturnValue(new Promise((resolve) => resolve([Map(product)])))

            const {queryByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        newMessage: fromJS({
                            newMessage: {
                                attachments: attachments,
                            },
                        }),
                    })}
                >
                    <CampaignMessage
                        showContentWarning
                        isConvertSubscriber={true}
                        richAreaRef={jest.fn()}
                        agents={[]}
                        html=""
                        text=""
                        selectedAgent=""
                        onSelectAgent={jest.fn()}
                        onChangeMessage={jest.fn()}
                        onDeleteAttachment={jest.fn()}
                    />
                </Provider>
            )

            await act(flushPromises)

            expect(
                queryByText(
                    'Your campaign is currently not displayed because there is no product stock for your first product card. Remove the first product card to see have your campaign displayed.'
                )
            ).toBeInTheDocument()
        })

        it('it does not display error message out of stock warning banner', async () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Continue,
            })
            const product = shopifyProductFixture({variants: [variant]})

            jest.spyOn(
                integrationHelpers,
                'fetchIntegrationProducts'
            ).mockReturnValue(new Promise((resolve) => resolve([Map(product)])))

            const {queryByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        newMessage: fromJS({
                            newMessage: {
                                attachments: attachments,
                            },
                        }),
                    })}
                >
                    <CampaignMessage
                        showContentWarning
                        isConvertSubscriber={true}
                        richAreaRef={jest.fn()}
                        agents={[]}
                        html=""
                        text=""
                        selectedAgent=""
                        onSelectAgent={jest.fn()}
                        onChangeMessage={jest.fn()}
                        onDeleteAttachment={jest.fn()}
                    />
                </Provider>
            )

            await act(flushPromises)

            expect(
                queryByText(
                    'Your campaign is currently not displayed because there is no product stock for your first product card. Remove the first product card to see have your campaign displayed.'
                )
            ).toBeNull()
        })
    })
})
