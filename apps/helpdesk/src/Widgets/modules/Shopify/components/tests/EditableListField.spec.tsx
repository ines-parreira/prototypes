import type React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useSaveTagsInTicketDraft from 'hooks/useSaveTagsInTicketDraft'
import { fetchShopTags } from 'models/integration/resources/shopify'
import { ShopifyTags } from 'models/integration/types'
import type { LeafTemplate } from 'models/widget/types'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'
import { FALLBACK_VALUE } from 'Widgets/modules/Template/modules/Field'

import {
    editableListCustomization,
    EditableListField,
} from '../EditableListField'

jest.mock('hooks/useSaveTagsInTicketDraft')
const useSaveTagsInTicketDraftMock = assumeMock(useSaveTagsInTicketDraft)

const saveTagsInDraftMock = jest.fn()
useSaveTagsInTicketDraftMock.mockReturnValue({
    saveTagsInDraft: saveTagsInDraftMock,
})

jest.mock('models/integration/resources/shopify', () => {
    return {
        fetchShopTags: jest.fn().mockResolvedValue(['tag0', 'tag1', 'tag2']),
    }
})

const executeAction = jest.fn()

const minProps = {
    selectedOptions: '',
    activeCustomerId: 1,
    widgetIsEditing: false,
    currentAccount: fromJS({}),
    executeAction: executeAction,
}

const widgetContextValue = {
    data_source: 'Customer' as const,
    widget_resource_ids: {
        target_id: null,
        customer_id: null,
    },
}
const integrationContextValue = { integration: fromJS({}), integrationId: 1 }

describe('<EditableListField/>', () => {
    const mockStore = configureMockStore([thunk])
    const storeData = {
        infobarActions: {
            shopify: {
                cancelOrder: {},
                createOrder: fromJS({ payload: {}, loading: false }),
                refundOrder: {},
                editOrder: {},
                editShippingAddress: {},
            },
        },
    }
    const integrationContextData = { integration: fromJS({}), integrationId: 1 }

    it('should render an empty list because no options has been given', () => {
        const { container } = render(
            <ShopifyContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditableListField {...minProps} />
                </IntegrationContext.Provider>
            </ShopifyContext.Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render a list with some tags in it', () => {
        minProps.selectedOptions = 'cool, super'
        const { container } = render(
            <ShopifyContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditableListField {...minProps} />
                </IntegrationContext.Provider>
            </ShopifyContext.Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    describe('_onFocus()', () => {
        it.each([
            [
                {
                    data_source: 'Customer' as const,
                    widget_resource_ids: {
                        target_id: null,
                        customer_id: null,
                    },
                },
                ShopifyTags.customers,
            ],
            [
                {
                    data_source: 'Order' as const,
                    widget_resource_ids: {
                        target_id: null,
                        customer_id: null,
                    },
                },
                ShopifyTags.orders,
            ],
        ])('should call fetchShopTags()', (widget, tagsType) => {
            render(
                <Provider store={mockStore(storeData)}>
                    <ShopifyContext.Provider value={widget}>
                        <IntegrationContext.Provider
                            value={integrationContextData}
                        >
                            <EditableListField
                                {...minProps}
                                selectedOptions={'test1, test2'}
                            />
                        </IntegrationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            const input = screen.getAllByPlaceholderText('Add tags...')[0]

            fireEvent.focus(input)

            expect(fetchShopTags).toHaveBeenCalledTimes(1)
            expect(fetchShopTags).toHaveBeenCalledWith(
                integrationContextData.integrationId,
                tagsType,
            )
        })
    })

    describe('_submitChanges()', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should call executeAction and saveTagsInDraft when Customer tags are changed', () => {
            const mockStore = configureMockStore([thunk])
            const storeData = {
                infobarActions: {
                    shopify: {
                        cancelOrder: {},
                        createOrder: fromJS({ payload: {}, loading: false }),
                        refundOrder: {},
                        editOrder: {},
                        editShippingAddress: {},
                    },
                },
            }

            render(
                <Provider store={mockStore(storeData)}>
                    <ShopifyContext.Provider value={widgetContextValue}>
                        <IntegrationContext.Provider
                            value={integrationContextValue}
                        >
                            <EditableListField
                                {...minProps}
                                selectedOptions="tag1, tag2"
                            />
                        </IntegrationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            const closeIcon = screen.getAllByText('close')[0]

            fireEvent.click(closeIcon)

            const input = screen.getByPlaceholderText('Add tags...')
            fireEvent.blur(input)

            expect(executeAction).toHaveBeenCalledWith({
                actionName: 'shopifyUpdateCustomerTags',
                integrationId: 1,
                customerId: '1',
                payload: { tags_list: 'tag2' },
            })

            expect(saveTagsInDraftMock).toHaveBeenCalledWith('tag2')
        })

        it('should call executeAction and saveTagsInDraft when Order tags are changed', () => {
            const mockStore = configureMockStore([thunk])
            const storeData = {
                infobarActions: {
                    shopify: {
                        cancelOrder: {},
                        createOrder: fromJS({ payload: {}, loading: false }),
                        refundOrder: {},
                        editOrder: {},
                        editShippingAddress: {},
                    },
                },
            }

            const orderWidgetContextValue = {
                data_source: 'Order' as const,
                widget_resource_ids: {
                    target_id: 123,
                    customer_id: 456,
                },
            }

            render(
                <Provider store={mockStore(storeData)}>
                    <ShopifyContext.Provider value={orderWidgetContextValue}>
                        <IntegrationContext.Provider
                            value={integrationContextValue}
                        >
                            <EditableListField
                                {...minProps}
                                selectedOptions="order-tag1, order-tag2"
                            />
                        </IntegrationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            const closeIcon = screen.getAllByText('close')[0]

            fireEvent.click(closeIcon)

            const input = screen.getByPlaceholderText('Add tags...')
            fireEvent.blur(input)

            expect(executeAction).toHaveBeenCalledWith({
                actionName: 'shopifyUpdateOrderTags',
                integrationId: 1,
                customerId: '1',
                payload: {
                    tags_list: 'order-tag2',
                    order_id: 123,
                },
            })

            expect(saveTagsInDraftMock).toHaveBeenCalledWith('order-tag2')
        })

        it('should not call executeAction when tags have not changed', () => {
            const mockStore = configureMockStore([thunk])
            const storeData = {
                infobarActions: {
                    shopify: {
                        cancelOrder: {},
                        createOrder: fromJS({ payload: {}, loading: false }),
                        refundOrder: {},
                        editOrder: {},
                        editShippingAddress: {},
                    },
                },
            }

            render(
                <Provider store={mockStore(storeData)}>
                    <ShopifyContext.Provider value={widgetContextValue}>
                        <IntegrationContext.Provider
                            value={integrationContextValue}
                        >
                            <EditableListField
                                {...minProps}
                                selectedOptions="tag1, tag2"
                            />
                        </IntegrationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            const input = screen.getByPlaceholderText('Add tags...')

            fireEvent.blur(input)
            executeAction.mockClear()
            saveTagsInDraftMock.mockClear()

            fireEvent.blur(input)

            expect(executeAction).not.toHaveBeenCalled()
            expect(saveTagsInDraftMock).not.toHaveBeenCalled()
        })

        it('should not call executeAction when integrationId is missing', () => {
            const mockStore = configureMockStore([thunk])
            const storeData = {
                infobarActions: {
                    shopify: {
                        cancelOrder: {},
                        createOrder: fromJS({ payload: {}, loading: false }),
                        refundOrder: {},
                        editOrder: {},
                        editShippingAddress: {},
                    },
                },
            }

            const integrationContextWithoutId = {
                integration: fromJS({}),
                integrationId: null,
            }

            render(
                <Provider store={mockStore(storeData)}>
                    <ShopifyContext.Provider value={widgetContextValue}>
                        <IntegrationContext.Provider
                            value={integrationContextWithoutId}
                        >
                            <EditableListField
                                {...minProps}
                                selectedOptions="tag1, tag2"
                            />
                        </IntegrationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            const input = screen.getByPlaceholderText('Add tags...')

            fireEvent.blur(input)

            expect(executeAction).not.toHaveBeenCalled()
            expect(saveTagsInDraftMock).not.toHaveBeenCalled()
        })
    })
})

describe('editableListCustomization', () => {
    it.each([
        ['whatever.customer.tags', true],
        ['whatever.orders.[].tags', true],
        ['whatever.orders.[]', false],
        ['whatever.customer', false],
        ['whatever.customer.smth', false],
        ['whatever.orders', false],
        ['whatever.orders.[].smth', false],
    ])(
        'has a dataMatcher that matches or not the given path',
        (match, output) => {
            expect(editableListCustomization.dataMatcher?.test(match)).toBe(
                output,
            )
        },
    )

    it('should return a getValueString function returning null', () => {
        expect(
            editableListCustomization.getValueString({}, {} as LeafTemplate),
        ).toBeNull()
    })

    it('should return a getValue function whose return is the ConnectedEditableListField', () => {
        const value = editableListCustomization.getValue(
            'something',
            {} as LeafTemplate,
        ) as React.ReactElement<React.ComponentProps<typeof EditableListField>>

        expect(value.props.selectedOptions).toBe('something')
    })

    it('should return a getValue function whose return is the fallback value if source is not a string', () => {
        expect(editableListCustomization.getValue({}, {} as LeafTemplate)).toBe(
            FALLBACK_VALUE,
        )
    })
})
