import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {ShopifyTags} from 'models/integration/types'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {WidgetContext} from 'providers/infobar/WidgetContext'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {ActionButtonContext} from '../ActionButton'
import {EditableListWidget} from '../EditableListWidget'

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
    data_source: 'customer',
    widget_resource_ids: {
        target_id: null,
        customer_id: null,
    },
}
const integrationContextValue = {integration: fromJS({}), integrationId: 1}
const actionButtonContextValue = {actionError: ''}

describe('<EditableListWidget/>', () => {
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

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render an empty list because no options has been given', () => {
        const {container} = render(
            <WidgetContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ActionButtonContext.Provider
                        value={actionButtonContextValue}
                    >
                        <EditableListWidget {...minProps} />
                    </ActionButtonContext.Provider>
                </IntegrationContext.Provider>
            </WidgetContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render a list with some tags in it', () => {
        minProps.selectedOptions = 'cool, super'
        const {container} = render(
            <WidgetContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ActionButtonContext.Provider
                        value={actionButtonContextValue}
                    >
                        <EditableListWidget {...minProps} />
                    </ActionButtonContext.Provider>
                </IntegrationContext.Provider>
            </WidgetContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    describe('_onFocus()', () => {
        it.each([
            [
                {
                    data_source: 'Customer',
                    widget_resource_ids: {
                        target_id: null,
                        customer_id: null,
                    },
                },
                ShopifyTags.customers,
            ],
            [
                {
                    data_source: 'Order',
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
                    <WidgetContext.Provider value={widget}>
                        <IntegrationContext.Provider
                            value={integrationContextData}
                        >
                            <EditableListWidget
                                {...minProps}
                                selectedOptions={'test1, test2'}
                            />
                        </IntegrationContext.Provider>
                    </WidgetContext.Provider>
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
