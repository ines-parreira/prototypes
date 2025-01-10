import {screen, fireEvent, render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {shopifyDraftOrderPayloadFixture} from 'fixtures/shopify'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {ShopifyTags} from 'models/integration/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {ShopifyActionType} from 'Widgets/modules/Shopify/types'

import {OrderFooterComponent} from '../OrderFooter'

jest.useFakeTimers()

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

jest.mock('models/integration/resources/shopify', () => {
    return {
        fetchShopTags: jest.fn().mockResolvedValue(['tag0', 'tag1', 'tag2']),
    }
})

describe('<OrderFooterComponent/>', () => {
    const mockStore = configureMockStore([thunk])
    const storeData = {
        infobarActions: {
            shopify: {
                cancelOrder: {},
                createOrder: fromJS({payload: {}, loading: false}),
                refundOrder: {},
                editOrder: {},
                editShippingAddress: {},
            },
        },
    }
    const integrationContextData = {integration: fromJS({}), integrationId: 1}
    let onPayloadChange: jest.MockedFunction<
        ComponentProps<typeof OrderFooterComponent>['onPayloadChange']
    >

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderFooterComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            payload={fromJS(shopifyDraftOrderPayloadFixture())}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render with tags', () => {
            const payload = shopifyDraftOrderPayloadFixture()
            payload.tags = 'tag1,tag2,tag3'

            const {container} = render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderFooterComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            payload={fromJS(payload)}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('_onNoteChange()', () => {
        it.each([
            [ShopifyActionType.CreateOrder],
            [ShopifyActionType.DuplicateOrder],
        ])(
            'should call onPayloadChange() with updated payload',
            (actionName) => {
                const payload = fromJS(
                    shopifyDraftOrderPayloadFixture()
                ) as Map<any, any>

                render(
                    <Provider store={mockStore(storeData)}>
                        <IntegrationContext.Provider
                            value={integrationContextData}
                        >
                            <OrderFooterComponent
                                editable
                                actionName={actionName}
                                currencyCode="USD"
                                payload={payload}
                                onPayloadChange={onPayloadChange}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                fireEvent.change(screen.getAllByRole('textbox')[0], {
                    target: {
                        value: 'new note',
                    },
                })

                expect(onPayloadChange).toHaveBeenCalled()
            }
        )
    })

    describe('_onTagsChange()', () => {
        it.each([
            [ShopifyActionType.CreateOrder],
            [ShopifyActionType.DuplicateOrder],
        ])(
            'should call onPayloadChange() with updated payload',
            (actionName) => {
                const payload = fromJS(
                    shopifyDraftOrderPayloadFixture()
                ) as Map<any, any>

                render(
                    <Provider store={mockStore(storeData)}>
                        <IntegrationContext.Provider
                            value={integrationContextData}
                        >
                            <OrderFooterComponent
                                editable
                                actionName={actionName}
                                currencyCode="USD"
                                payload={payload}
                                onPayloadChange={onPayloadChange}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                fireEvent.change(screen.getAllByRole('textbox')[1], {
                    target: {
                        value: 'new tag 1',
                    },
                })
                fireEvent.keyDown(screen.getAllByRole('textbox')[1], {
                    key: 'Enter',
                    code: 'Enter',
                    charCode: 13,
                })

                expect(onPayloadChange).toHaveBeenCalled()
            }
        )
    })

    describe('handleFocus()', () => {
        it.each([
            [ShopifyActionType.CreateOrder],
            [ShopifyActionType.DuplicateOrder],
        ])('should call fetchShopTags()', (actionName) => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >

            render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderFooterComponent
                            editable
                            actionName={actionName}
                            currencyCode="USD"
                            payload={payload}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            const input = screen.getByPlaceholderText('Add tags...')

            fireEvent.focus(input)

            expect(fetchShopTags).toHaveBeenCalledTimes(1)
            expect(fetchShopTags).toHaveBeenCalledWith(
                integrationContextData.integrationId,
                ShopifyTags.orders
            )
        })
    })
})
