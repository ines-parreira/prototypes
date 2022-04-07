import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {screen, fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {ShopifyTags} from 'models/integration/types'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {
    SegmentEvent,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import {shopifyDraftOrderPayloadFixture} from '../../../../../../../../../../../../../fixtures/shopify'
import {ShopifyActionType} from '../../../../types'
import {IntegrationContext} from '../../../../../IntegrationContext'
import {OrderFooterComponent} from '../OrderFooter'
import MultiSelectOptionsField from '../../../../../../../../../../../forms/MultiSelectOptionsField/MultiSelectOptionsField'

jest.useFakeTimers()

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker',
    () => {
        const segmentTracker: Record<string, unknown> = jest.requireActual(
            '../../../../../../../../../../../../../store/middlewares/segmentTracker'
        )
        return {
            ...segmentTracker,
            logEvent: jest.fn(),
        }
    }
)

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
        jest.clearAllMocks()
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
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderNotesChanged,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderNotesChanged,
            ],
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
                expect(logEvent).toHaveBeenCalled()
            }
        )
    })

    describe('_onTagsChange()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderTagsChanged,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderTagsChanged,
            ],
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
                expect(logEvent).toHaveBeenCalled()
            }
        )
    })

    describe('handleFocus()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderTagsChanged,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderTagsChanged,
            ],
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

            MultiSelectOptionsField.prototype.setState = jest.fn()

            const input = screen.getAllByPlaceholderText('Add tags...')[0]

            fireEvent.click(input)

            expect(fetchShopTags).toBeCalledTimes(1)
            expect(fetchShopTags).toBeCalledWith(
                integrationContextData.integrationId,
                ShopifyTags.orders
            )
        })
    })
})
