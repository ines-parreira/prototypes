import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {ShopifyTags} from 'models/integration/types'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {LeafTemplate} from 'models/widget/types'

import {ShopifyContext} from 'Widgets/modules/Shopify/contexts/ShopifyContext'
import {FALLBACK_VALUE} from 'Widgets/modules/Template/modules/Field'

import {
    EditableListField,
    editableListCustomization,
} from '../EditableListField'

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
const integrationContextValue = {integration: fromJS({}), integrationId: 1}

describe('<EditableListField/>', () => {
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

    it('should render an empty list because no options has been given', () => {
        const {container} = render(
            <ShopifyContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditableListField {...minProps} />
                </IntegrationContext.Provider>
            </ShopifyContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render a list with some tags in it', () => {
        minProps.selectedOptions = 'cool, super'
        const {container} = render(
            <ShopifyContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditableListField {...minProps} />
                </IntegrationContext.Provider>
            </ShopifyContext.Provider>
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
                </Provider>
            )

            MultiSelectOptionsField.prototype.setState = jest.fn()

            const input = screen.getAllByPlaceholderText('Add tags...')[0]

            fireEvent.click(input)

            expect(fetchShopTags).toBeCalledTimes(1)
            expect(fetchShopTags).toBeCalledWith(
                integrationContextData.integrationId,
                tagsType
            )
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
                output
            )
        }
    )

    it('should return a getValueString function returning null', () => {
        expect(
            editableListCustomization.getValueString({}, {} as LeafTemplate)
        ).toBeNull()
    })

    it('should return a getValue function whose return is the ConnectedEditableListField', () => {
        const value = editableListCustomization.getValue(
            'something',
            {} as LeafTemplate
        ) as React.ReactElement<React.ComponentProps<typeof EditableListField>>

        expect(value.props.selectedOptions).toBe('something')
    })

    it('should return a getValue function whose return is the fallback value if source is not a string', () => {
        expect(editableListCustomization.getValue({}, {} as LeafTemplate)).toBe(
            FALLBACK_VALUE
        )
    })
})
