import React from 'react'
import {fromJS} from 'immutable'
import {mount} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

import InfobarWidgets from '../InfobarWidgets'

import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
} from 'state/widgets/constants'

describe('InfobarWidgets component', () => {
    let store
    let container

    const httpIntegrationId = 1
    const shopifyIntegrationId = 2
    const rechargeIntegrationId = 3
    const bigcommerceIntegrationId = 4
    const appId = '5dfgsadsasad'

    const baseEditing = {
        actions: {
            foo: () => {},
            removeEditedWidget: () => {},
        },
        isEditing: false,
        isDragging: false,
        state: fromJS({}),
        canDrop: () => true,
    }

    let baseSource = fromJS({
        ticket: {
            customer: {
                integrations: {},
            },
        },
    })

    baseSource = baseSource.setIn(
        ['ticket', 'customer', 'integrations', httpIntegrationId.toString()],
        fromJS({foo: httpIntegrationId.toString()})
    )
    baseSource = baseSource.setIn(
        ['ticket', 'customer', 'integrations', shopifyIntegrationId.toString()],
        fromJS({bar: shopifyIntegrationId.toString()})
    )
    baseSource = baseSource.setIn(
        ['ticket', 'customer', 'external_data', appId],
        fromJS({
            bar: appId,
            [THIRD_PARTY_APP_NAME_KEY]: 'My 3rd party awesome app',
        })
    )

    const baseWidgets = fromJS([
        {
            id: 4,
            type: 'http',
            integration_id: httpIntegrationId,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Foo container',
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
            type: 'shopify',
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Bar container',
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
            type: 'recharge',
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Baz container',
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
            type: 'bigcommerce',
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Baz container',
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
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: '',
                        type: 'card',
                        title: 'Foo container',
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
            order: 5,
        },
    ])

    beforeEach(() => {
        store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: httpIntegrationId,
                        type: 'http',
                        name: 'my little http integration',
                    },
                    {
                        id: shopifyIntegrationId,
                        type: 'shopify',
                        name: 'my little shopify integration',
                    },
                    {
                        id: rechargeIntegrationId,
                        type: 'recharge',
                        name: 'my little recharge integration',
                    },
                    {
                        id: bigcommerceIntegrationId,
                        type: 'bigcommerce',
                        name: 'my little bigcommerce integration',
                    },
                ],
            }),
        })

        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    it("should not display anything if there's no widgets", () => {
        const component = mount(
            <InfobarWidgets
                store={store}
                widgets={null}
                context="ticket"
                editing={baseEditing}
                source={baseSource}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display http and shopify data in non-editing mode', () => {
        const component = mount(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={baseWidgets}
                    context="ticket"
                    editing={baseEditing}
                    source={baseSource}
                    displayTabs={true}
                />
            </Provider>,
            {attachTo: container}
        )

        expect(component).toMatchSnapshot()
    })

    it('should display widgets in editing mode', () => {
        const editing = Object.assign({}, baseEditing, {isEditing: true})
        const component = mount(
            <Provider store={store}>
                <InfobarWidgets
                    widgets={baseWidgets}
                    context="ticket"
                    editing={editing}
                    source={baseSource}
                />
            </Provider>,
            {attachTo: container}
        )

        expect(component).toMatchSnapshot()
    })
})
