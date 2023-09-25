import React, {ComponentProps} from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {mockFlags} from 'jest-launchdarkly-mock'

import {CustomerTimelineButton} from 'pages/tickets/detail/components/CustomerTimeline/CustomerTimelineButton'
import {StoreDispatch, RootState} from 'state/types'
import {
    HTTP_INTEGRATION_TYPE,
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    SMILE_INTEGRATION_TYPE,
    BIGCOMMERCE_INTEGRATION_TYPE,
} from 'constants/integration'
import {assumeMock} from 'utils/testing'

import {FeatureFlagKey} from 'config/featureFlags'
import InfobarCustomerInfo from '../InfobarCustomerInfo'

jest.mock(
    'pages/tickets/detail/components/CustomerTimeline/CustomerTimelineButton'
)
jest.mock('../CustomerChannels', () => () => <div>CustomerChannels</div>)
jest.mock('../InfobarWidgets/InfobarWidgets', () => () => (
    <div>InfobarWidgets</div>
))

const mockedCustomerTimelineButton = assumeMock(CustomerTimelineButton)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [{type: HTTP_INTEGRATION_TYPE}],
    }),
})

const minProps: ComponentProps<typeof InfobarCustomerInfo> = {
    isEditing: false,
    sources: fromJS({}),
    widgets: fromJS({}),
    customer: fromJS({id: 1, name: 'foo'}),
}

describe('<InfobarCustomerInfo/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedCustomerTimelineButton.mockImplementation(() => (
            <div>Customer timeline</div>
        ))
        mockFlags({
            [FeatureFlagKey.CustomerTimelineButton]: true,
        })
    })

    it('should not render because there is no passed customer', () => {
        const component = shallow(
            <Provider store={store}>
                <InfobarCustomerInfo {...minProps} customer={undefined} />{' '}
            </Provider>
        )

        expect(component).toEqual({})
    })

    it('should not render because the passed customer is empty', () => {
        const component = shallow(
            <Provider store={store}>
                <InfobarCustomerInfo {...minProps} customer={fromJS({})} />{' '}
            </Provider>
        )

        expect(component).toEqual({})
    })

    it(
        'should render basic customer info and a "generate widgets" button because customer data are loaded, the user ' +
            'is currently editing widgets, it is not currently dragging anything and widgets are currently empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const widgets = fromJS({
                currentContext: 'ticket',
                _internal: {
                    drag: {isDragging: false},
                    editedItems: [{template: {}}],
                    hasFetchedWidgets: true,
                },
                items: [],
            })

            const component = shallow(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                        isEditing
                    />{' '}
                </Provider>
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render basic customer info and empty widgets because customer data are loaded, the user is currently ' +
            'editing widgets and it is dragging a widget -- even though widgets are currently empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const widgets = fromJS({
                currentContext: 'ticket',
                _internal: {
                    drag: {isDragging: true},
                    editedItems: [{template: {}}],
                    hasFetchedWidgets: true,
                },
                items: [],
            })

            const component = shallow(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                        isEditing
                    />{' '}
                </Provider>
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render only basic customer info because customer data are loaded, the user is not editing widgets and ' +
            'current widgets are empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const widgets = fromJS({
                currentContext: 'ticket',
                _internal: {hasFetchedWidgets: true},
                items: [],
            })

            const component = shallow(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                    />{' '}
                </Provider>
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'sources render basic customer info and widgets because there is customer data, the user is not editing ' +
            'widgets and current widgets are not empty',
        () => {
            const sources = fromJS({
                ticket: {
                    customer: {
                        integrations: {
                            118: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const context = 'ticket'

            const widgets = fromJS({
                currentContext: context,
                _internal: {hasFetchedWidgets: true},
                items: [
                    {
                        id: 1,
                        context,
                        template: {foo: 'bar'},
                    },
                ],
            })

            const component = mount(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                    />
                </Provider>
            )

            expect(component.text()).toContain('Customer timeline')

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render only basic customer info because there is no customer data and there is some data integrations ' +
            'configured for the account',
        () => {
            const component = mount(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={fromJS({})}
                        widgets={fromJS({currentContext: 'ticket'})}
                    />{' '}
                </Provider>
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render basic customer info and the suggestion to add integrations because there is no customer data ' +
            'and there is no data integrations configured for the account',
        () => {
            const component = mount(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={fromJS({})}
                        widgets={fromJS({currentContext: 'ticket'})}
                    />{' '}
                </Provider>
            )

            expect(component).toMatchSnapshot()
        }
    )

    it.each([
        HTTP_INTEGRATION_TYPE,
        MAGENTO2_INTEGRATION_TYPE,
        RECHARGE_INTEGRATION_TYPE,
        SHOPIFY_INTEGRATION_TYPE,
        SMILE_INTEGRATION_TYPE,
        BIGCOMMERCE_INTEGRATION_TYPE,
    ])(
        'should pass `hasIntegrations=true` because there is an active integration of type %s',
        (integrationType) => {
            const component = shallow(
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: [{type: integrationType}],
                        }),
                    })}
                >
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={fromJS({})}
                        widgets={fromJS({currentContext: 'ticket'})}
                    />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        }
    )

    it('should pass `hasIntegrations=false` because there is no active data integration', () => {
        const component = shallow(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                })}
            >
                <InfobarCustomerInfo
                    {...minProps}
                    sources={fromJS({})}
                    widgets={fromJS({currentContext: 'ticket'})}
                />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })
})
