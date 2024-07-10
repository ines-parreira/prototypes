import React from 'react'
import {List, Map, fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {agents} from 'fixtures/agents'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

import {assumeMock} from 'utils/testing'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_KEY,
    CUSTOMER_ECOMMERCE_DATA_KEY,
    CUSTOM_WIDGET_TYPE,
} from 'state/widgets/constants'
import {WidgetEnvironment} from 'state/widgets/types'
import {IntegrationType} from 'models/integration/constants'
import {EditionContext} from 'providers/infobar/EditionContext'
import Template from 'Infobar/features/Template'
import Widget from 'Infobar/features/Widget'
import {WidgetContextProvider} from 'Infobar/features/Widget/contexts/WidgetContext'

import InfobarWidgets from '../InfobarWidgets'
import Placeholder from '../widgets/Placeholder'

jest.mock('Infobar/features/Template')
const mockedTemplate = assumeMock(Template)
mockedTemplate.mockImplementation(() => <div>Template</div>)

jest.mock('../widgets/Placeholder')
const mockedPlaceholder = assumeMock(Placeholder)
mockedPlaceholder.mockImplementation(() => <div>Placeholder</div>)

jest.mock('Infobar/features/Widget/contexts/WidgetContext')
const mockedWidgetContextProvider = assumeMock(WidgetContextProvider)
mockedWidgetContextProvider.mockImplementation(({children}) => <>{children}</>)

// for some reason, spyOn doesn’t work with this import
jest.mock('Infobar/features/Widget', () => {
    const widgetExports = jest.requireActual<Record<string, unknown>>(
        'Infobar/features/Widget'
    )
    const Widget = widgetExports.default as React.FC
    const WidgetMock = jest.fn((props) => <Widget {...props} />)
    return {
        ...widgetExports,
        default: WidgetMock,
    }
})
const mockedWidget = assumeMock(Widget)

describe('InfobarWidgets component', () => {
    const httpIntegrationId = 1
    const shopifyIntegrationId = 2
    const rechargeIntegrationId = 3
    const bigcommerceIntegrationId = 4
    const appId = '5dfgsadsasad'

    const ecommerceIntegrationId = 5
    const ecommerceStoreUUID = 'foo-bar-uuid'

    const store = mockStore({
        customers: fromJS({active: {name: 'Johanna'}}),
        ticket: fromJS({someData: '1234'}),
        widgets: fromJS({}),
        currentUser: fromJS(agents[0]),
        integrations: fromJS({
            integrations: [
                {
                    id: httpIntegrationId,
                    type: IntegrationType.Http,
                    name: 'my little http integration',
                },
                {
                    id: shopifyIntegrationId,
                    type: IntegrationType.Shopify,
                    name: 'my little shopify integration',
                },
                {
                    id: rechargeIntegrationId,
                    type: IntegrationType.Recharge,
                    name: 'my little recharge integration',
                },
                {
                    id: bigcommerceIntegrationId,
                    type: IntegrationType.BigCommerce,
                    name: 'my little bigcommerce integration',
                },
                {
                    id: ecommerceIntegrationId,
                    type: IntegrationType.Ecommerce,
                    name: 'my little ecommerce integration',
                    meta: {
                        store_uuid: ecommerceStoreUUID,
                    },
                },
            ],
        }),
    })

    const baseSource = fromJS({
        ticket: {
            customer: {
                integrations: {
                    [httpIntegrationId]: {foo: httpIntegrationId},
                    [shopifyIntegrationId]: {bar: shopifyIntegrationId},
                },
                [CUSTOMER_EXTERNAL_DATA_KEY]: {
                    [appId]: {
                        fizz: appId,
                        [THIRD_PARTY_APP_NAME_KEY]: 'My 3rd party awesome app',
                    },
                },
                [CUSTOMER_ECOMMERCE_DATA_KEY]: {
                    [ecommerceStoreUUID]: {
                        foo: 'bar',
                        store: {
                            helpdesk_integration_id: ecommerceIntegrationId,
                        },
                    },
                },
            },
        },
    }) as Map<string, unknown>

    const widgets = [
        {
            id: 3,
            type: STANDALONE_WIDGET_TYPE,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        meta: {
                            custom: {
                                links: [
                                    {
                                        url: 'https://www.yolo.com',
                                        label: 'Yolo',
                                    },
                                ],
                            },
                        },
                        path: '',
                        type: 'card',
                        title: 'Standalone',
                        widgets: [],
                    },
                ],
            },
            order: 0,
        },
        {
            id: 4,
            type: IntegrationType.Http,
            integration_id: httpIntegrationId,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'HTTP',
                        widgets: [
                            {
                                path: 'foo',
                                type: 'text',
                                title: 'Foo',
                                order: 1,
                            },
                        ],
                    },
                ],
            },
            order: 2,
        },
        {
            id: 5,
            type: IntegrationType.Shopify,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Shopify',
                        widgets: [
                            {
                                path: 'bar',
                                type: 'text',
                                title: 'Bar',
                                order: 1,
                            },
                        ],
                    },
                ],
            },
            order: 3,
        },
        {
            id: 6,
            type: IntegrationType.Recharge,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Recharge',
                        widgets: [
                            {
                                path: 'baz',
                                type: 'text',
                                title: 'Baz',
                                order: 1,
                            },
                        ],
                    },
                ],
            },
            order: 4,
        },
        {
            id: 7,
            type: IntegrationType.BigCommerce,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'BigCommerce',
                        widgets: [
                            {
                                path: 'baz',
                                type: 'text',
                                title: 'Baz',
                                order: 1,
                            },
                        ],
                    },
                ],
            },
            order: 5,
        },
        {
            id: 8,
            type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            app_id: appId,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: '3rd party',
                        widgets: [
                            {
                                path: 'fizz',
                                type: 'text',
                                title: 'Fizz',
                                order: 1,
                            },
                        ],
                    },
                ],
            },
            order: 6,
        },
        {
            id: 9,
            type: WOOCOMMERCE_WIDGET_TYPE,
            integration_id: ecommerceIntegrationId,
            context: WidgetEnvironment.Ticket,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'WooCommerce Data',
                        widgets: [
                            {
                                path: 'foo',
                                type: 'text',
                                title: 'Foo',
                                order: 1,
                            },
                        ],
                    },
                ],
            },
            order: 6,
        },
    ]

    const baseWidgets = fromJS(widgets) as List<Map<string, unknown>>

    it("should not display anything if there's no widgets", () => {
        const {container} = render(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={null}
                    context={WidgetEnvironment.Ticket}
                    source={baseSource}
                />
            </Provider>
        )

        expect(container.firstChild).toBeNull()
    })

    it('should display integrations with data and 3rd party / standalone widget in non-editing mode', () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <InfobarWidgets
                        widgets={baseWidgets}
                        context={WidgetEnvironment.Ticket}
                        source={baseSource}
                        displayTabs
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(
            mockedWidgetContextProvider.mock.calls[0][0].value.get('type')
        ).toEqual(baseWidgets.getIn(['0', 'type']))
        expect(
            mockedWidgetContextProvider.mock.calls[1][0].value.get('type')
        ).toEqual(baseWidgets.getIn(['1', 'type']))
        expect(
            mockedWidgetContextProvider.mock.calls[2][0].value.get('type')
        ).toEqual(baseWidgets.getIn(['2', 'type']))
        expect(
            mockedWidgetContextProvider.mock.calls[3][0].value.get('type')
        ).toEqual(baseWidgets.getIn(['5', 'type']))
        expect(
            mockedWidgetContextProvider.mock.calls[4][0].value.get('type')
        ).toEqual(baseWidgets.getIn(['6', 'type']))
        expect(mockedTemplate.mock.calls.length).toEqual(5)
    })

    it('should display all possible widgets in editing mode', () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <InfobarWidgets
                        widgets={baseWidgets}
                        context={WidgetEnvironment.Ticket}
                        source={baseSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )
        expect(
            mockedTemplate.mock.calls.length +
                mockedPlaceholder.mock.calls.length
        ).toEqual(baseWidgets.size)
    })

    it('should add the templatePath key in the passed template that matches the index', () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <InfobarWidgets
                        widgets={baseWidgets}
                        context={WidgetEnvironment.Ticket}
                        source={baseSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )
        expect(mockedTemplate.mock.calls[1][0].template?.templatePath).toEqual(
            '1.template'
        )
    })

    it('should set absolutePath in passed template', () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <InfobarWidgets
                        widgets={baseWidgets}
                        context={WidgetEnvironment.Ticket}
                        source={baseSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )
        expect(mockedTemplate.mock.calls[1][0].template?.absolutePath).toEqual([
            'ticket',
            'customer',
            'integrations',
            httpIntegrationId.toString(),
        ])
    })

    it('should not break if data source is null with custom actions', () => {
        const widgets = fromJS([
            {
                id: 666,
                type: CUSTOM_WIDGET_TYPE,
                context: WidgetEnvironment.Ticket,
                template: {
                    type: 'wrapper',
                    widgets: [
                        {
                            meta: {
                                custom: {
                                    buttons: [
                                        {
                                            label: 'Foo',
                                            action: {
                                                url: 'https://foo.com',
                                                body: {
                                                    contentType:
                                                        'application/json',
                                                    'application/json': [],
                                                },
                                                method: 'POST',
                                                params: [],
                                                headers: [],
                                            },
                                        },
                                    ],
                                },
                            },
                            path: '',
                            type: 'card',
                            title: 'Custom',
                            widgets: [
                                {
                                    path: 'foo',
                                    type: 'text',
                                    title: 'Foo',
                                    order: 1,
                                },
                            ],
                        },
                    ],
                },
            },
        ])

        const source = fromJS({
            ticket: {
                customer: {
                    data: null,
                },
            },
        })

        render(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={widgets}
                    context={WidgetEnvironment.Ticket}
                    source={source}
                />
            </Provider>
        )
    })

    // This test here is only to ensure we don't break the memoization set before starting
    // the recursion in the InfobarWidget component
    it('should not rerender all widgets if some unrelated data changes in ticket object', () => {
        const isEditionValue = {isEditing: true}
        const {rerender} = render(
            <Provider store={store}>
                <EditionContext.Provider value={isEditionValue}>
                    <InfobarWidgets
                        widgets={baseWidgets}
                        context={WidgetEnvironment.Ticket}
                        source={baseSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        mockedWidget.mockClear()

        const newSource = baseSource.setIn(
            ['ticket', 'customer', 'unrelated'],
            'bar'
        )

        rerender(
            <Provider store={store}>
                <EditionContext.Provider value={isEditionValue}>
                    <InfobarWidgets
                        widgets={baseWidgets}
                        context={WidgetEnvironment.Ticket}
                        source={newSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )
        expect(mockedWidget.mock.calls.length).toBe(0)
    })
})
