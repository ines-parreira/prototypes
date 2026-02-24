import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockGetCustomerHandler } from '@gorgias/helpdesk-mocks'

import { agents } from 'fixtures/agents'
import { IntegrationType } from 'models/integration/constants'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { EditionContext } from 'providers/infobar/EditionContext'
import {
    CUSTOMER_ECOMMERCE_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import Widget from 'Widgets/modules/Widget'

import InfobarWidgets, {
    findHTTPIntegrationRelatedWidget,
} from '../InfobarWidgets'
import Placeholder from '../widgets/Placeholder'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn().mockReturnValue(false),
}))

jest.mock('../widgets/Placeholder')
const mockedPlaceholder = assumeMock(Placeholder)
mockedPlaceholder.mockImplementation(() => <div>Placeholder</div>)

// for some reason, spyOn doesn’t work with this import
jest.mock('Widgets/modules/Widget')
const mockedWidget = assumeMock(Widget)
mockedWidget.mockImplementation(() => <div>Widget</div>)

describe('InfobarWidgets component', () => {
    const httpIntegrationId = 1
    const shopifyIntegrationId = 2
    const rechargeIntegrationId = 3
    const bigcommerceIntegrationId = 4
    const appId = '5dfgsadsasad'

    const ecommerceIntegrationId = 5
    const ecommerceStoreUUID = 'foo-bar-uuid'

    const store = mockStore({
        customers: fromJS({ active: { name: 'Johanna' } }),
        ticket: fromJS({ someData: '1234' }),
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
                    [httpIntegrationId]: { foo: httpIntegrationId },
                    [shopifyIntegrationId]: { bar: shopifyIntegrationId },
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
        const { container } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <InfobarWidgets
                        widgets={null}
                        context={WidgetEnvironment.Ticket}
                        source={baseSource}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should display integrations with data and 3rd party / standalone widget in non-editing mode', () => {
        render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <EditionContext.Provider value={{ isEditing: false }}>
                            <InfobarWidgets
                                widgets={baseWidgets}
                                context={WidgetEnvironment.Ticket}
                                source={baseSource}
                                displayTabs
                            />
                        </EditionContext.Provider>
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(mockedWidget.mock.calls.length).toEqual(5)
        expect(mockedWidget).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                source: undefined,
                absolutePath: '[]',
                index: 0,
                widget: baseWidgets.get(0),
                type: undefined,
                template: baseWidgets.get(0).get('template'),
            }),
            {},
        )
        expect(mockedWidget).toHaveBeenNthCalledWith(
            5,
            expect.objectContaining({
                source: baseSource.getIn([
                    'ticket',
                    'customer',
                    CUSTOMER_ECOMMERCE_DATA_KEY,
                    ecommerceStoreUUID,
                ]),
                absolutePath: JSON.stringify([
                    'ticket',
                    'customer',
                    CUSTOMER_ECOMMERCE_DATA_KEY,
                    ecommerceStoreUUID,
                ]),
                index: 4,
                widget: baseWidgets.get(6),
                type: undefined,
                template: baseWidgets.get(6).get('template'),
            }),
            {},
        )
    })

    it('should display all possible widgets in editing mode', () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <EditionContext.Provider value={{ isEditing: true }}>
                        <InfobarWidgets
                            widgets={baseWidgets}
                            context={WidgetEnvironment.Ticket}
                            source={baseSource}
                        />
                    </EditionContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )
        expect(
            mockedWidget.mock.calls.length +
                mockedPlaceholder.mock.calls.length,
        ).toEqual(baseWidgets.size)
    })

    it('should not display standalone widget twice when it has an existing http integration id ', () => {
        const standaloneWidgets = fromJS([
            {
                id: 3,
                type: STANDALONE_WIDGET_TYPE,
                integration_id: httpIntegrationId,
                context: WidgetEnvironment.Ticket,
                template: {
                    type: 'wrapper',
                    widgets: [
                        {
                            path: '',
                            type: 'card',
                            title: 'Standalone',
                            widgets: [],
                        },
                    ],
                },
                order: 0,
            },
        ]) as List<Map<string, unknown>>

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <EditionContext.Provider value={{ isEditing: false }}>
                            <InfobarWidgets
                                widgets={standaloneWidgets}
                                context={WidgetEnvironment.Ticket}
                                source={baseSource}
                                displayTabs
                            />
                        </EditionContext.Provider>
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(mockedWidget.mock.calls.length).toEqual(1)

        expect(mockedWidget.mock.calls[0][0].widget.get('type')).toEqual(
            STANDALONE_WIDGET_TYPE,
        )
    })

    // This test here is only to ensure we don't break the memoization set before starting
    // the recursion in the InfobarWidget component
    it('should not rerender all widgets if some unrelated data changes in ticket object', () => {
        const isEditionValue = { isEditing: true }
        const { rerender } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <EditionContext.Provider value={isEditionValue}>
                        <InfobarWidgets
                            widgets={baseWidgets}
                            context={WidgetEnvironment.Ticket}
                            source={baseSource}
                        />
                    </EditionContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        mockedWidget.mockClear()

        const newSource = baseSource.setIn(
            ['ticket', 'customer', 'unrelated'],
            'bar',
        )

        rerender(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <EditionContext.Provider value={isEditionValue}>
                        <InfobarWidgets
                            widgets={baseWidgets}
                            context={WidgetEnvironment.Ticket}
                            source={newSource}
                        />
                    </EditionContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )
        expect(mockedWidget.mock.calls.length).toBe(0)
    })

    describe('effectiveSource with RQ data', () => {
        const server = setupServer()
        const rqQueryClient = mockQueryClient()

        beforeAll(() => {
            server.listen()
        })

        beforeEach(() => {
            server.resetHandlers()
            rqQueryClient.clear()
            mockedWidget.mockClear()
        })

        afterAll(() => {
            server.close()
        })

        const shopifyWidget = fromJS([
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
                order: 1,
            },
        ]) as List<Map<string, unknown>>

        it('should pass effectiveSource data to Widget source prop when RQ returns integration data', async () => {
            const customerId = 123
            const rqIntegrations = {
                [shopifyIntegrationId]: {
                    bar: 'rq-value',
                    customer: { name: 'RQ Shopify Customer' },
                },
            }

            const mock = mockGetCustomerHandler(async () =>
                HttpResponse.json({
                    id: customerId,
                    integrations: rqIntegrations,
                }),
            )
            server.use(mock.handler)

            const sourceWithOldData = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            [shopifyIntegrationId]: {
                                bar: 'old-source-value',
                            },
                        },
                    },
                },
            }) as Map<string, unknown>

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={rqQueryClient}>
                            <CustomerContext.Provider value={{ customerId }}>
                                <EditionContext.Provider
                                    value={{ isEditing: false }}
                                >
                                    <InfobarWidgets
                                        widgets={shopifyWidget}
                                        context={WidgetEnvironment.Ticket}
                                        source={sourceWithOldData}
                                        displayTabs
                                    />
                                </EditionContext.Provider>
                            </CustomerContext.Provider>
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            await waitFor(() => {
                const widgetCalls = mockedWidget.mock.calls
                const matchingCall = widgetCalls.find(
                    (call) => call[0].source?.toJS?.()?.bar === 'rq-value',
                )
                expect(matchingCall).toBeDefined()

                const props = matchingCall![0] as {
                    source: Map<string, unknown>
                }
                expect(props.source.toJS()).toEqual(
                    rqIntegrations[shopifyIntegrationId],
                )
            })
        })

        it('should fall back to original source for passedSource when RQ data is not available', () => {
            const sourceWithIntegrations = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            [shopifyIntegrationId]: {
                                bar: shopifyIntegrationId,
                            },
                        },
                    },
                },
            }) as Map<string, unknown>

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={rqQueryClient}>
                            <EditionContext.Provider
                                value={{ isEditing: false }}
                            >
                                <InfobarWidgets
                                    widgets={shopifyWidget}
                                    context={WidgetEnvironment.Ticket}
                                    source={sourceWithIntegrations}
                                    displayTabs
                                />
                            </EditionContext.Provider>
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            const widgetCalls = mockedWidget.mock.calls
            const callWithSource = widgetCalls.find(
                (call) => call[0].source !== undefined,
            )
            expect(callWithSource).toBeDefined()
            expect(callWithSource![0].source).toEqual(
                sourceWithIntegrations.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    String(shopifyIntegrationId),
                ]),
            )
        })
    })
})

describe('findHTTPIntegrationRelatedWidget', () => {
    it('should find a widget with matching HTTP integration ID', () => {
        const httpIntegrationId = '123'
        const widgets = fromJS([
            {
                id: 1,
                type: IntegrationType.Shopify,
                integration_id: '456',
            },
            {
                id: 2,
                type: IntegrationType.Http,
                integration_id: 123,
            },
            {
                id: 3,
                type: IntegrationType.Http,
                integration_id: '789',
            },
        ]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId,
            widgets,
        )

        expect(result).toBeDefined()
        expect(result?.get('id')).toBe(2)
        expect(result?.get('integration_id')).toBe(123)
    })

    it('should return undefined when no widget matches the HTTP integration ID', () => {
        const httpIntegrationId = '999'
        const widgets = fromJS([
            {
                id: 1,
                type: IntegrationType.Shopify,
                integration_id: '456',
            },
            {
                id: 2,
                type: IntegrationType.Http,
                integration_id: '123',
            },
        ]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId,
            widgets,
        )

        expect(result).toBeUndefined()
    })

    it('should exclude standalone widgets even if integration ID matches', () => {
        const httpIntegrationId = '123'
        const widgets = fromJS([
            {
                id: 1,
                type: STANDALONE_WIDGET_TYPE,
                integration_id: 123,
            },
            {
                id: 2,
                type: IntegrationType.Http,
                integration_id: '456',
            },
        ]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId,
            widgets,
        )

        expect(result).toBeUndefined()
    })

    it('should match when integration IDs are different types but same value', () => {
        const httpIntegrationId = '123'
        const widgets = fromJS([
            {
                id: 1,
                type: IntegrationType.Http,
                integration_id: 123, // number
            },
        ]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId, // string
            widgets,
        )

        expect(result).toBeDefined()
        expect(result?.get('id')).toBe(1)
    })

    it('should handle empty widget list', () => {
        const httpIntegrationId = '123'
        const widgets = fromJS([]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId,
            widgets,
        )

        expect(result).toBeUndefined()
    })

    it('should handle widgets with undefined integration_id', () => {
        const httpIntegrationId = '123'
        const widgets = fromJS([
            {
                id: 1,
                type: IntegrationType.Http,
                // integration_id is undefined
            },
            {
                id: 2,
                type: IntegrationType.Http,
                integration_id: '123',
            },
        ]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId,
            widgets,
        )

        expect(result).toBeDefined()
        expect(result?.get('id')).toBe(2)
    })

    it('should handle undefined widgets or widgets with undefined type', () => {
        const httpIntegrationId = '123'
        const widgets = fromJS([
            undefined,
            {
                id: 1,
                // type is undefined
                integration_id: '123',
            },
            {
                id: 2,
                type: IntegrationType.Http,
                integration_id: '456',
            },
        ]) as List<Map<string, unknown>>

        const result = findHTTPIntegrationRelatedWidget(
            httpIntegrationId,
            widgets,
        )

        expect(result).toBeDefined()
        expect(result?.get('id')).toBe(1)
    })
})
