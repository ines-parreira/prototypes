import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'

import Order, {statusColors} from '../Order'

const mockStore = configureMockStore([thunk])

const orderWidgets = Order()
const BeforeContent = orderWidgets.BeforeContent
const AfterContent = orderWidgets.AfterContent
const TitleWrapper = orderWidgets.TitleWrapper

jest.mock('pages/common/utils/labels', () => {
    const utilsLabels: Record<string, unknown> = jest.requireActual(
        'pages/common/utils/labels'
    )

    return {
        ...utilsLabels,
        DatetimeLabel: 'time',
    }
})

describe('Order', () => {
    describe('<BeforeContent/>', () => {
        const customerId = 1
        const orderId = 2
        const integrationId = 1

        const shipments = [
            {
                order_id: orderId,
                entity_id: 963,
                updated_at: '2019-03-04 11:12',
                tracks: [
                    {
                        track_number: '123ABC',
                        carrier_code: 'UPS',
                        tracking_url: 'https://foo.com',
                    },
                    {
                        track_number: '456DEF',
                        carrier_code: 'DHL',
                        tracking_url: 'https://bar.com',
                    },
                ],
                items: [
                    {
                        order_item_id: 118,
                        qty: 4,
                        name: 'Sneakers',
                    },
                    {
                        order_item_id: 218,
                        qty: 1,
                        name: 'Pants',
                    },
                ],
            },
            {
                order_id: orderId,
                entity_id: 741,
                updated_at: '2019-02-04 11:12',
                tracks: [
                    {
                        track_number: '789GHJ',
                        carrier_code: 'LaPoste',
                        tracking_url: 'https://laposte.net',
                    },
                ],
                items: [],
            },
        ]

        const storeUrl = 'magento.gorgi.us'
        const adminUrlSuffix = 'admin_123'
        const createdAt = '"2020-10-07 09:30:03"'

        describe('render()', () => {
            it.each(Object.keys(statusColors))(
                `should render with a label for the %s state and a created at date but no shipments because there are none`,
                (state) => {
                    const {container} = render(
                        <Provider
                            store={mockStore({
                                customers: fromJS({
                                    active: {
                                        id: customerId,
                                        integrations: {
                                            [integrationId]: {
                                                customer: {id: customerId},
                                                shipments: [],
                                            },
                                        },
                                    },
                                }),
                            })}
                        >
                            <IntegrationContext.Provider
                                value={{
                                    integrationId,
                                    integration: fromJS({}),
                                }}
                            >
                                <BeforeContent
                                    currentUserTimezone="US/Pacific"
                                    source={fromJS({
                                        customer_id: customerId,
                                        entity_id: orderId,
                                        state: state,
                                        created_at: createdAt,
                                    })}
                                />
                            </IntegrationContext.Provider>
                        </Provider>
                    )

                    expect(container).toMatchSnapshot()
                }
            )

            it(`should render the state and an empty created at date but no shipments because there are none`, () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId]: {
                                            customer: {id: customerId},
                                            shipments: [],
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integrationId,
                                integration: fromJS({}),
                            }}
                        >
                            <BeforeContent
                                currentUserTimezone="US/Pacific"
                                source={fromJS({
                                    customer_id: customerId,
                                    entity_id: orderId,
                                    state: statusColors.new,
                                })}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should display shipments with links because there is an admin url suffix', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId]: {
                                            customer: {id: customerId},
                                            shipments,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integrationId,
                                integration: fromJS({
                                    meta: {
                                        store_url: storeUrl,
                                        admin_url_suffix: adminUrlSuffix,
                                    },
                                }),
                            }}
                        >
                            <BeforeContent
                                currentUserTimezone="US/Pacific"
                                source={fromJS({
                                    customer_id: customerId,
                                    entity_id: orderId,
                                    state: statusColors.new,
                                    created_at: createdAt,
                                })}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should display shipments without links because there is no admin url suffix', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId]: {
                                            customer: {id: customerId},
                                            shipments,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integrationId,
                                integration: fromJS({
                                    meta: {
                                        store_url: storeUrl,
                                        admin_url_suffix: '',
                                    },
                                }),
                            }}
                        >
                            <BeforeContent
                                currentUserTimezone="US/Pacific"
                                source={fromJS({
                                    customer_id: customerId,
                                    entity_id: orderId,
                                    state: statusColors.new,
                                    created_at: createdAt,
                                })}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })
        })
    })

    describe('<TitleWrapper/>', () => {
        const integrationId = 3
        describe('render()', () => {
            it('should not render link because there is no admin url suffix', () => {
                const {container} = render(
                    <IntegrationContext.Provider
                        value={{
                            integrationId,
                            integration: fromJS({
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: '',
                                },
                            }),
                        }}
                    >
                        <TitleWrapper source={fromJS({entity_id: 1})}>
                            <div>foo bar</div>
                        </TitleWrapper>
                    </IntegrationContext.Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should render link', () => {
                const {container} = render(
                    <IntegrationContext.Provider
                        value={{
                            integrationId,
                            integration: fromJS({
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: 'admin_12df',
                                },
                            }),
                        }}
                    >
                        <TitleWrapper source={fromJS({entity_id: 1})}>
                            <div>foo bar</div>
                        </TitleWrapper>{' '}
                    </IntegrationContext.Provider>
                )

                expect(container).toMatchSnapshot()
            })
        })
    })

    describe('<AfterContent/>', () => {
        const customerId = 1
        const orderId = 2
        const integrationId = 5

        const creditMemos = [
            {
                order_id: orderId,
                entity_id: 852,
                updated_at: '2018-11-07 05:22',
                items: [
                    {
                        order_item_id: 741,
                        qty: 4,
                        name: 'Sneakers',
                    },
                    {
                        order_item_id: 753,
                        qty: 1,
                        name: 'T-shirt',
                    },
                ],
            },
            {
                order_id: orderId,
                entity_id: 854,
                updated_at: '2018-11-07 05:22',
                items: [],
            },
        ]

        describe('render()', () => {
            it('should return null because the order has no shipments nor credit memos', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId]: {
                                            customer: {id: customerId},
                                            shipments: [],
                                            credit_memos: [],
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integrationId,
                                integration: fromJS({}),
                            }}
                        >
                            <AfterContent
                                source={fromJS({
                                    customer_id: customerId,
                                    entity_id: orderId,
                                })}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should display credit memos with links because there is an admin url suffix', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId]: {
                                            customer: {id: customerId},
                                            shipments: [],
                                            credit_memos: creditMemos,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integrationId,
                                integration: fromJS({
                                    meta: {
                                        store_url: 'magento.gorgi.us',
                                        admin_url_suffix: 'admin_123',
                                    },
                                }),
                            }}
                        >
                            <AfterContent
                                source={fromJS({
                                    customer_id: customerId,
                                    entity_id: orderId,
                                })}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should display credit memos without links because there is no admin url suffix', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId]: {
                                            customer: {id: customerId},
                                            shipments: [],
                                            credit_memos: creditMemos,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integrationId,
                                integration: fromJS({
                                    id: integrationId,
                                    meta: {
                                        store_url: 'magento.gorgi.us',
                                        admin_url_suffix: '',
                                    },
                                }),
                            }}
                        >
                            <AfterContent
                                source={fromJS({
                                    customer_id: customerId,
                                    entity_id: orderId,
                                })}
                            />
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })
        })
    })
})
