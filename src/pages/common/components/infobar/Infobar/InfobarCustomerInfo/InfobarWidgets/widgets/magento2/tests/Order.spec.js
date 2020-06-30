import React from 'react'
import {fromJS} from 'immutable'
import {mount, shallow} from 'enzyme'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Order, {statusColors} from '../Order'

const mockStore = configureMockStore([thunk])

const orderWidgets = Order()
const BeforeContent = orderWidgets.BeforeContent
const AfterContent = orderWidgets.AfterContent
const TitleWrapper = orderWidgets.TitleWrapper

jest.mock('../../../../../../../../utils/labels', () => {
    return {
        ...require.requireActual('../../../../../../../../utils/labels'),
        DatetimeLabel: 'DatetimeLabelMock',
    }
})

describe('Order', () => {
    describe('<BeforeContent/>', () => {
        describe('render()', () => {
            for (const state of Object.keys(statusColors)) {
                it(`should render with a label for the ${state} state`, () => {
                    const component = shallow(
                        <BeforeContent source={fromJS({state})} />
                    )

                    expect(component).toMatchSnapshot()
                })
            }
        })
    })

    describe('<TitleWrapper/>', () => {
        describe('render()', () => {
            it('should not render link because there is no admin url suffix', () => {
                const component = shallow(
                    <TitleWrapper source={fromJS({entity_id: 1})}>
                        <div>foo bar</div>
                    </TitleWrapper>,
                    {
                        context: {
                            integration: fromJS({
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: '',
                                },
                            }),
                        },
                    }
                )

                expect(component).toMatchSnapshot()
            })

            it('should render link', () => {
                const component = shallow(
                    <TitleWrapper source={fromJS({entity_id: 1})}>
                        <div>foo bar</div>
                    </TitleWrapper>,
                    {
                        context: {
                            integration: fromJS({
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: 'admin_12df',
                                },
                            }),
                        },
                    }
                )

                expect(component).toMatchSnapshot()
            })
        })
    })

    describe('<AfterContent/>', () => {
        const customerId = 1
        const orderId = 2
        const integrationId = 3

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
                entity_id: 852,
                updated_at: '2018-11-07 05:22',
                items: [],
            },
        ]

        describe('render()', () => {
            it('should return null because the order has no shipments nor credit memos', () => {
                const component = shallow(
                    <AfterContent
                        store={mockStore({
                            customers: fromJS({
                                active: {
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
                        source={fromJS({
                            customer_id: customerId,
                            entity_id: orderId,
                        })}
                    />
                )

                expect(component).toEqual({})
            })

            it('should display shipments with links because there is an admin url suffix', () => {
                const component = mount(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId.toString()]: {
                                            customer: {id: customerId},
                                            shipments,
                                            credit_memos: [],
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <AfterContent
                            source={fromJS({
                                customer_id: customerId,
                                entity_id: orderId,
                            })}
                        />
                    </Provider>,
                    {
                        context: {
                            integration: fromJS({
                                id: integrationId,
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: 'admin_123',
                                },
                            }),
                        },
                        childContextTypes: {
                            integration: ImmutablePropTypes.map.isRequired,
                        },
                    }
                )

                expect(component.children()).toMatchSnapshot()
            })

            it('should display shipments without links because there is no admin url suffix', () => {
                const component = mount(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId.toString()]: {
                                            customer: {id: customerId},
                                            shipments,
                                            credit_memos: [],
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <AfterContent
                            source={fromJS({
                                customer_id: customerId,
                                entity_id: orderId,
                            })}
                        />
                    </Provider>,
                    {
                        context: {
                            integration: fromJS({
                                id: integrationId,
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: '',
                                },
                            }),
                        },
                        childContextTypes: {
                            integration: ImmutablePropTypes.map.isRequired,
                        },
                    }
                )

                expect(component.children()).toMatchSnapshot()
            })

            it('should display credit memos with links because there is an admin url suffix', () => {
                const component = mount(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId.toString()]: {
                                            customer: {id: customerId},
                                            shipments: [],
                                            credit_memos: creditMemos,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <AfterContent
                            source={fromJS({
                                customer_id: customerId,
                                entity_id: orderId,
                            })}
                        />
                    </Provider>,
                    {
                        context: {
                            integration: fromJS({
                                id: integrationId,
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: 'admin_123',
                                },
                            }),
                        },
                        childContextTypes: {
                            integration: ImmutablePropTypes.map.isRequired,
                        },
                    }
                )

                expect(component.children()).toMatchSnapshot()
            })

            it('should display credit memos without links because there is no admin url suffix', () => {
                const component = mount(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId.toString()]: {
                                            customer: {id: customerId},
                                            shipments: [],
                                            credit_memos: creditMemos,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <AfterContent
                            source={fromJS({
                                customer_id: customerId,
                                entity_id: orderId,
                            })}
                        />
                    </Provider>,
                    {
                        context: {
                            integration: fromJS({
                                id: integrationId,
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: '',
                                },
                            }),
                        },
                        childContextTypes: {
                            integration: ImmutablePropTypes.map.isRequired,
                        },
                    }
                )

                expect(component.children()).toMatchSnapshot()
            })

            it('should display both shipments and credit memos with links because there is an admin url suffix', () => {
                const component = mount(
                    <Provider
                        store={mockStore({
                            customers: fromJS({
                                active: {
                                    id: customerId,
                                    integrations: {
                                        [integrationId.toString()]: {
                                            customer: {id: customerId},
                                            shipments,
                                            credit_memos: creditMemos,
                                        },
                                    },
                                },
                            }),
                        })}
                    >
                        <AfterContent
                            source={fromJS({
                                customer_id: customerId,
                                entity_id: orderId,
                            })}
                        />
                    </Provider>,
                    {
                        context: {
                            integration: fromJS({
                                id: integrationId,
                                meta: {
                                    store_url: 'magento.gorgi.us',
                                    admin_url_suffix: 'admin_123',
                                },
                            }),
                        },
                        childContextTypes: {
                            integration: ImmutablePropTypes.map.isRequired,
                        },
                    }
                )

                expect(component.children()).toMatchSnapshot()
            })
        })
    })
})
