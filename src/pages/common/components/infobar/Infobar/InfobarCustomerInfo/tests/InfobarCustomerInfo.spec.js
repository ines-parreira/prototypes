import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    HTTP_INTEGRATION_TYPE,
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    SMILE_INTEGRATION_TYPE,
    BIGCOMMERCE_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration.ts'

import InfobarCustomerInfo, {
    InfobarCustomerInfoContainer,
} from '../InfobarCustomerInfo.tsx'

jest.mock('../CustomerChannels.tsx', () => () => <div>CustomerChannels</div>)
jest.mock('../InfobarWidgets/InfobarWidgets.js', () => () => (
    <div>InfobarWidgets</div>
))

const mockStore = configureMockStore([thunk])

const actions = {
    setEditedWidgets: jest.fn(),
    setEditionAsDirty: jest.fn(),
    resetWidgets: jest.fn(),
    generateAndSetWidgets: jest.fn(),
}

describe('<InfobarCustomerInfo/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should not render because there is no passed customer', () => {
        const component = shallow(
            <InfobarCustomerInfoContainer
                actions={actions}
                customer={null}
                sources={fromJS({})}
                widgets={fromJS({})}
                hasIntegrations={true}
                isEditing={false}
            />
        )

        expect(component).toEqual({})
    })

    it('should not render because the passed customer is empty', () => {
        const component = shallow(
            <InfobarCustomerInfoContainer
                actions={actions}
                sources={fromJS({})}
                customer={fromJS({})}
                widgets={fromJS({})}
                hasIntegrations={true}
                isEditing={false}
            />
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
                <InfobarCustomerInfoContainer
                    actions={actions}
                    sources={sources}
                    widgets={widgets}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing
                    hasIntegrations
                />
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
                <InfobarCustomerInfoContainer
                    actions={actions}
                    sources={sources}
                    widgets={widgets}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing
                    hasIntegrations
                />
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
                <InfobarCustomerInfoContainer
                    actions={actions}
                    sources={sources}
                    widgets={widgets}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing={false}
                    hasIntegrations
                />
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
                <InfobarCustomerInfoContainer
                    actions={actions}
                    sources={sources}
                    widgets={widgets}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing={false}
                    hasIntegrations
                />
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render only basic customer info because there is no customer data and there is some data integrations ' +
            'configured for the account',
        () => {
            const component = shallow(
                <InfobarCustomerInfoContainer
                    actions={actions}
                    sources={fromJS({})}
                    widgets={fromJS({currentContext: 'ticket'})}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing={false}
                    hasIntegrations
                />
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render basic customer info and the suggestion to add integrations because there is no customer data ' +
            'and there is no data integrations configured for the account',
        () => {
            const component = shallow(
                <InfobarCustomerInfoContainer
                    actions={actions}
                    sources={fromJS({})}
                    widgets={fromJS({currentContext: 'ticket'})}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing={false}
                    hasIntegrations={false}
                />
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
                <InfobarCustomerInfo
                    store={mockStore({
                        integrations: fromJS({
                            integrations: [{type: integrationType}],
                        }),
                    })}
                    actions={actions}
                    sources={fromJS({})}
                    widgets={fromJS({currentContext: 'ticket'})}
                    customer={fromJS({id: 1, name: 'foo'})}
                    isEditing={false}
                />
            )

            expect(component).toMatchSnapshot()
        }
    )

    it('should pass `hasIntegrations=false` because there is no active data integration', () => {
        const component = shallow(
            <InfobarCustomerInfo
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                })}
                actions={actions}
                sources={fromJS({})}
                widgets={fromJS({currentContext: 'ticket'})}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing={false}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
