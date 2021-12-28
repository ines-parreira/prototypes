import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationContext} from '../../IntegrationContext.ts'
import {AfterTitle, BeforeContent, TitleWrapper, Wrapper} from '../Order.tsx'

const mockStore = configureMockStore([thunk])
const integrationContextData = {integration: fromJS({}), integrationId: 1}

describe('Order', () => {
    describe('<AfterTitle/>', () => {
        it('should not render because widgets are being edited', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({})}>
                            <AfterTitle
                                source={fromJS({})}
                                isEditing={true}
                                getIntegrationData={() => fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should not render because no integration id was provided', () => {
            const {container} = render(
                <AfterTitle
                    source={fromJS({})}
                    isEditing={false}
                    getIntegrationData={() => fromJS({})}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should not display the refund action because the order was cancelled', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper
                            source={fromJS({
                                status: 'cancelled',
                                charge_status: 'success',
                            })}
                        >
                            <AfterTitle
                                source={fromJS({
                                    id: 1,
                                    total_price: 10.0,
                                })}
                                isEditing={false}
                                getIntegrationData={() => fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should not display the refund action because the order was refunded', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper
                            source={fromJS({
                                status: 'refunded',
                                charge_status: 'partially_refunded',
                            })}
                        >
                            <AfterTitle
                                source={fromJS({
                                    id: 1,
                                    total_price: 10.0,
                                })}
                                isEditing={false}
                                getIntegrationData={() => fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should not display the refund action because the charge is not refundable', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper
                            source={fromJS({
                                status: 'nope',
                                charge_status: 'nope',
                            })}
                        >
                            <AfterTitle
                                source={fromJS({
                                    id: 1,
                                    total_price: 10.0,
                                })}
                                isEditing={false}
                                getIntegrationData={() => fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the refund action', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper
                            source={fromJS({
                                status: 'nope',
                                charge_status: 'success',
                            })}
                        >
                            <AfterTitle
                                source={fromJS({
                                    id: 1,
                                    total_price: 10.0,
                                })}
                                isEditing={false}
                                getIntegrationData={() => fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the refund action (because total_price > total_refunds)', () => {
            const chargeId = 1
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper
                            source={fromJS({
                                status: 'nope',
                                charge_status: 'success',
                            })}
                        >
                            <AfterTitle
                                source={fromJS({
                                    id: 1,
                                    total_price: '10.00',
                                    charge_id: chargeId,
                                })}
                                isEditing={false}
                                getIntegrationData={() =>
                                    fromJS({
                                        charges: [
                                            {
                                                id: chargeId,
                                                total_refunds: '4.00',
                                            },
                                        ],
                                    })
                                }
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('<BeforeContent/>', () => {
        it('should render the total_refunds field to 0.00 because the value on the associated charge is null', () => {
            const chargeId = 1
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({})}>
                            <BeforeContent
                                source={fromJS({
                                    charge_status: 'success',
                                    charge_id: chargeId,
                                })}
                                getIntegrationData={() =>
                                    fromJS({
                                        charges: [
                                            {
                                                id: chargeId,
                                                total_refunds: null,
                                            },
                                        ],
                                    })
                                }
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with the total_refunds field from the associated charge', () => {
            const chargeId = 1
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({})}>
                            <BeforeContent
                                source={fromJS({
                                    charge_status: 'success',
                                    charge_id: chargeId,
                                })}
                                getIntegrationData={() =>
                                    fromJS({
                                        charges: [
                                            {
                                                id: chargeId,
                                                total_refunds: '5.00',
                                            },
                                        ],
                                    })
                                }
                            />{' '}
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('<TitleWrapper/>', () => {
        it('should not render any link because no customer hash was passed', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_name: 'storegorgias3'},
                            }),
                        }}
                    >
                        <Wrapper source={fromJS({})}>
                            <TitleWrapper
                                source={fromJS({order_id: 1})}
                                template={fromJS({})}
                                getIntegrationData={() => fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the base link because a customer hash was passed and no custom link is set', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_name: 'storegorgias3'},
                            }),
                        }}
                    >
                        <Wrapper source={fromJS({})}>
                            <TitleWrapper
                                source={fromJS({
                                    order_id: 1,
                                    customer_id: 4564,
                                    id: 2345,
                                })}
                                template={fromJS({})}
                                getIntegrationData={() =>
                                    fromJS({customer: {hash: 's8d4f6sdf4'}})
                                }
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the custom link because a customer hash was passed and a custom link is set', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_name: 'storegorgias3'},
                            }),
                        }}
                    >
                        <Wrapper source={fromJS({})}>
                            <TitleWrapper
                                source={fromJS({order_id: 1})}
                                template={fromJS({
                                    meta: {
                                        link: 'https://google.com/{{customerHash}}',
                                    },
                                })}
                                getIntegrationData={() =>
                                    fromJS({customer: {hash: 's8d4f6sdf4'}})
                                }
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
