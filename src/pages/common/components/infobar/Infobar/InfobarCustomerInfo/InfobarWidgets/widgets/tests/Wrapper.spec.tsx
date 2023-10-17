import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from '@testing-library/react-hooks'
import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationType} from 'models/integration/types'
import * as actions from 'state/widgets/actions'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import Wrapper, {useIntegration} from '../Wrapper'

jest.spyOn(actions, 'removeEditedWidget')

const removeEditedWidget = actions.removeEditedWidget as jest.Mock

const mockStore = configureMockStore([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'http',
                name: 'my little http integration',
            },
            {
                id: 2,
                type: 'shopify',
                name: 'my little shopify integration',
            },
            {
                id: 3,
                type: IntegrationType.Ecommerce,
                name: 'my little ecommerce integration',
            },
        ],
    }),
})

const shopifyWidget = {
    id: 4,
    type: IntegrationType.Shopify,
    integration_id: 2,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 1,
}

const shopifySource = fromJS({foo: 'foo value'})

const httpWidget = {
    id: 5,
    type: IntegrationType.Http,
    integration_id: 1,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 2,
}

const httpSource = fromJS({bar: 'bar value'})

const customerExternalDataWidget = {
    id: 6,
    type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    app_id: '5dfgsadsasad',
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 3,
}

const customerExternalDataSource = fromJS({
    bar: 'bar value',
    [THIRD_PARTY_APP_NAME_KEY]: 'my-wonderful-app-name',
})

const woocommerceDataWidget = {
    id: 6,
    type: WOOCOMMERCE_WIDGET_TYPE,
    integration_id: 3,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 3,
}

const woocommerceDataSource = fromJS({
    foo: 'bar',
    store: {
        helpdesk_integration_id: 3,
    },
})

describe('InfobarWidgets component', () => {
    it('should display (without an edit or a remove icon)', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...shopifyWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(shopifyWidget)}
                        source={shopifySource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call the appropriate callback when clicking remove icon in edit mode', () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...shopifyWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(shopifyWidget)}
                        source={httpSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(screen.queryByText('edit')).toBeNull()
        fireEvent.click(screen.getAllByText('delete')[0])
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
    })

    it('should open and close the edit modal correctly', async () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...httpWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(httpWidget)}
                        source={shopifySource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(screen.getAllByText('edit')[0])
        expect(screen.findByText('Border color'))
        fireEvent.click(screen.getByText('Cancel'))
        await waitFor(() => {
            expect(screen.queryByText('Border color')).toBeNull()
        })
    })

    it('should have the proper color set', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...httpWidget.template,
                            meta: {
                                color: '#fff',
                            },
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(httpWidget)}
                        source={shopifySource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render customer external data widget with the proper id', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...customerExternalDataWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(customerExternalDataWidget)}
                        source={customerExternalDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render woocommerce widget with the proper id', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...woocommerceDataWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(woocommerceDataWidget)}
                        source={woocommerceDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})

// @ts-ignore
const wrapper = ({children}) => <Provider store={store}>{children}</Provider>

describe('useIntegration hook', () => {
    it('should return the integration extracted from the absolute path', () => {
        const absolutePath = ['a', 'b', 'c', '2']
        const widgetType = IntegrationType.Shopify
        const integrationId = 0
        const {result} = renderHook(
            () => useIntegration(absolutePath, widgetType, integrationId),
            {wrapper}
        )
        expect(result.current).toEqual(
            fromJS({
                id: 2,
                type: 'shopify',
                name: 'my little shopify integration',
            })
        )
    })

    it('should return the integration extracted from the integration id', () => {
        const absolutePath = [
            'a',
            'b',
            'c',
            'd9c28d74-683b-11ee-8c99-0242ac120002',
        ]
        const widgetType = IntegrationType.Shopify
        const integrationId = 2
        const {result} = renderHook(
            () => useIntegration(absolutePath, widgetType, integrationId),
            {wrapper}
        )
        expect(result.current).toEqual(
            fromJS({
                id: 2,
                type: 'shopify',
                name: 'my little shopify integration',
            })
        )
    })
})
