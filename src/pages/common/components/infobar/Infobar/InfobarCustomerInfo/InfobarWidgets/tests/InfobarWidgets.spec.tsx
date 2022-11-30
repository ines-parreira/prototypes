import React from 'react'
import {List, Map, fromJS} from 'immutable'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {agents} from 'fixtures/agents'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {WidgetContextType} from 'state/widgets/types'
import {IntegrationType} from 'models/integration/constants'
import {Editing} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'

import InfobarWidgets from '../InfobarWidgets'

describe('InfobarWidgets component', () => {
    const httpIntegrationId = 1
    const shopifyIntegrationId = 2
    const rechargeIntegrationId = 3
    const bigcommerceIntegrationId = 4
    const appId = '5dfgsadsasad'

    const store = mockStore({
        customers: fromJS({active: {name: 'Johanna'}}),
        ticket: fromJS({someData: '1234'}),
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
            ],
        }),
    })

    const baseEditing = {
        actions: {},
        isEditing: false,
        isDragging: false,
        state: fromJS({}),
        canDrop: () => true,
    } as unknown as Editing

    const baseSource = fromJS({
        ticket: {
            customer: {
                integrations: {
                    [httpIntegrationId]: {foo: httpIntegrationId},
                    [shopifyIntegrationId]: {bar: shopifyIntegrationId},
                },
                external_data: {
                    [appId]: {
                        fizz: appId,
                        [THIRD_PARTY_APP_NAME_KEY]: 'My 3rd party awesome app',
                    },
                },
            },
        },
    })

    const widgets = [
        {
            id: 3,
            type: STANDALONE_WIDGET_TYPE,
            context: WidgetContextType.Ticket,
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
            context: WidgetContextType.Ticket,
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
            order: 1,
        },
        {
            id: 5,
            type: IntegrationType.Shopify,
            context: WidgetContextType.Ticket,
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
            order: 2,
        },
        {
            id: 6,
            type: IntegrationType.Recharge,
            context: WidgetContextType.Ticket,
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
            order: 3,
        },
        {
            id: 7,
            type: IntegrationType.BigCommerce,
            context: WidgetContextType.Ticket,
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
            order: 4,
        },
        {
            id: 8,
            type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            app_id: appId,
            context: WidgetContextType.Ticket,
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
            order: 5,
        },
    ]

    const baseWidgets = fromJS(widgets) as List<Map<string, unknown>>

    it("should not display anything if there's no widgets", () => {
        const {container} = render(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={null}
                    context={WidgetContextType.Ticket}
                    editing={baseEditing}
                    source={baseSource}
                />
            </Provider>
        )

        expect(container.firstChild).toBeNull()
    })

    it('should display integrations with data and 3rd party / standalone widget in non-editing mode', () => {
        render(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={baseWidgets}
                    context={WidgetContextType.Ticket}
                    editing={baseEditing}
                    source={baseSource}
                    displayTabs
                />
            </Provider>
        )

        expect(screen.getAllByText(/shopify/i))
        expect(screen.getAllByText(/http/i))
        expect(screen.getAllByText(/standalone/i))
        expect(screen.getAllByText(/standalone/i))
        expect(screen.getAllByText(/3rd party/i))

        expect(screen.queryAllByText(/recharge/i).length).toBeFalsy()
        expect(screen.queryAllByText(/bigcommerce/i).length).toBeFalsy()
    })

    it('should display all possible widgets in editing mode', () => {
        render(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={baseWidgets}
                    context={WidgetContextType.Ticket}
                    editing={{...baseEditing, isEditing: true}}
                    source={baseSource}
                />
            </Provider>
        )
        ;(baseWidgets.toJS() as typeof widgets).map((widget) => {
            expect(
                screen.getAllByText(
                    new RegExp(widget.template.widgets[0].title, 'i')
                )
            ).toBeTruthy()
        })
    })
})
