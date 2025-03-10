import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    BIGCOMMERCE_INTEGRATION_TYPE,
    HTTP_INTEGRATION_TYPE,
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    SMILE_INTEGRATION_TYPE,
} from 'constants/integration'
import { useFlag } from 'core/flags'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

import InfobarCustomerInfo from '../InfobarCustomerInfo'

jest.mock('core/flags', () => ({
    ...jest.requireActual('core/flags'),
    useFlag: jest.fn(() => false),
}))
jest.mock('../LegacyCustomerTimelineButton', () => ({
    LegacyCustomerTimelineButton: () => <div>LegacyCustomerTimelineButton</div>,
}))
jest.mock('../CustomerTimelineWidget', () => ({
    CustomerTimelineWidget: () => <div>CustomerTimelineWidget</div>,
}))
jest.mock('../CustomerChannels', () => () => <div>CustomerChannels</div>)
jest.mock('../AddAppSuggestion', () => () => <div>Add app</div>)
jest.mock('../CustomerFields', () => () => <div>CustomerFields</div>)
jest.mock('../InfobarWidgets/InfobarWidgets', () => () => (
    <div>InfobarWidgets</div>
))
jest.mock('../CustomerOptionsDropdown', () => () => (
    <div>CustomerOptionsDropdown</div>
))

const useFlagMock = assumeMock(useFlag)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [{ type: HTTP_INTEGRATION_TYPE }],
    }),
})

const minProps: ComponentProps<typeof InfobarCustomerInfo> = {
    isEditing: false,
    sources: fromJS({}),
    widgets: fromJS({}),
    customer: fromJS({ id: 1, name: 'foo' }),
}

describe('<InfobarCustomerInfo/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useFlagMock.mockReturnValue(false)
    })

    it('should not render because there is no passed customer', () => {
        const { container } = render(
            <Provider store={store}>
                <InfobarCustomerInfo {...minProps} customer={undefined} />
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render because the passed customer is empty', () => {
        const { container } = render(
            <Provider store={store}>
                <InfobarCustomerInfo {...minProps} customer={fromJS({})} />
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render CustomerFields', () => {
        render(
            <Provider store={store}>
                <InfobarCustomerInfo {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('CustomerFields')).toBeInTheDocument()
    })

    it(
        'should render a "generate widgets" button because customer data are loaded, the user ' +
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
                    drag: { isDragging: false },
                    editedItems: [{ template: {} }],
                    hasFetchedWidgets: true,
                },
                items: [],
            })

            render(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                        isEditing
                    />{' '}
                </Provider>,
            )

            expect(screen.getByText('Generate default widgets'))
        },
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
                    drag: { isDragging: true },
                    editedItems: [{ template: {} }],
                    hasFetchedWidgets: true,
                },
                items: [],
            })

            const { container } = render(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                        isEditing
                    />{' '}
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it(
        'should not render empty widgets because the user is not editing widgets and ' +
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
                _internal: { hasFetchedWidgets: true },
                items: [],
            })

            render(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                    />{' '}
                </Provider>,
            )

            expect(screen.queryByText('InfobarWidgets')).toBeNull()
        },
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
                _internal: { hasFetchedWidgets: true },
                items: [
                    {
                        id: 1,
                        context,
                        template: { foo: 'bar' },
                    },
                ],
            })

            const { container } = render(
                <Provider store={store}>
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={sources}
                        widgets={widgets}
                    />
                </Provider>,
            )

            expect(screen.getByText('LegacyCustomerTimelineButton'))

            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it.each([
        HTTP_INTEGRATION_TYPE,
        MAGENTO2_INTEGRATION_TYPE,
        RECHARGE_INTEGRATION_TYPE,
        SHOPIFY_INTEGRATION_TYPE,
        SMILE_INTEGRATION_TYPE,
        BIGCOMMERCE_INTEGRATION_TYPE,
    ])(
        'should not display `AddAppSuggestion` because there is an active integration of type %s',
        (integrationType) => {
            render(
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: [{ type: integrationType }],
                        }),
                    })}
                >
                    <InfobarCustomerInfo
                        {...minProps}
                        sources={fromJS({})}
                        widgets={fromJS({ currentContext: 'ticket' })}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Add app')).toBeNull()
        },
    )

    it('should pass `AddAppSuggestion` because there is no active data integration', () => {
        render(
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
                    widgets={fromJS({ currentContext: 'ticket' })}
                />
            </Provider>,
        )

        expect(screen.getByText('Add app'))
    })

    it('should display the button `Edit Customer` because the flag is on', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <Provider store={store}>
                <InfobarCustomerInfo {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('CustomerOptionsDropdown')).toBeInTheDocument()
    })

    it('should display the button `Sync the customer to Shopify', () => {
        useFlagMock.mockReturnValue(true)
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    { type: HTTP_INTEGRATION_TYPE },
                    { type: SHOPIFY_INTEGRATION_TYPE },
                ],
            }),
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const customer = fromJS({
            integrations: [],
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: { isDragging: false },
                editedItems: [{ template: {} }],
                hasFetchedWidgets: true,
            },
            items: [],
        })

        render(
            <Provider store={store}>
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                    customer={customer}
                    isEditing={false}
                />{' '}
            </Provider>,
        )

        expect(screen.getByText('Sync Profile')).toBeInTheDocument()
    })

    it('should not display the button `Sync the customer to Shopify when there is no shopify integration', () => {
        useFlagMock.mockReturnValue(true)
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const customer = fromJS({
            integrations: [],
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: { isDragging: false },
                editedItems: [{ template: {} }],
                hasFetchedWidgets: true,
            },
            items: [],
        })

        render(
            <Provider store={store}>
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                    customer={customer}
                    isEditing={false}
                />{' '}
            </Provider>,
        )

        expect(screen.queryByText('Sync Profile')).not.toBeInTheDocument()
    })

    it('should not display the button `Sync the customer to Shopify when flag is off', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    { type: HTTP_INTEGRATION_TYPE },
                    { type: SHOPIFY_INTEGRATION_TYPE },
                ],
            }),
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const customer = fromJS({
            integrations: [],
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: { isDragging: false },
                editedItems: [{ template: {} }],
                hasFetchedWidgets: true,
            },
            items: [],
        })

        render(
            <Provider store={store}>
                <InfobarCustomerInfo
                    {...minProps}
                    sources={sources}
                    widgets={widgets}
                    customer={customer}
                    isEditing={false}
                />{' '}
            </Provider>,
        )
        expect(screen.queryByText('Sync Profile')).not.toBeInTheDocument()
    })
})
