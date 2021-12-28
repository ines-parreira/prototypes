import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationContext} from '../../IntegrationContext.ts'
import index, {
    SubscriptionAfterTitle,
    AfterContent,
    AfterTitle,
    TitleWrapperContainer,
} from '../Charge.tsx'

const BeforeContent = index().BeforeContent
const Wrapper = index().Wrapper

const mockStore = configureMockStore([thunk])
const integrationContextData = {integration: fromJS({}), integrationId: 1}

describe('Charge', () => {
    describe('SubscriptionAfterTitle', () => {
        it('should return null if isEditing', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({status: ''})}>
                            <SubscriptionAfterTitle
                                isEditing={true}
                                source={fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it("should return null if there's no integrationId", () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({status: 'success'})}>
                            <SubscriptionAfterTitle source={fromJS({})} />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should not display any action if the charge is nor queued nor skipped', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({status: 'success'})}>
                            <SubscriptionAfterTitle source={fromJS({})} />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the skipCharge action if the charge is queued', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({status: 'queued'})}>
                            <SubscriptionAfterTitle
                                source={fromJS({
                                    charge_id: 2,
                                    subscription_id: 3,
                                })}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the unskipCharge action if the charge is skipped', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({status: 'skipped'})}>
                            <SubscriptionAfterTitle
                                source={fromJS({
                                    charge_id: 2,
                                    subscription_id: 3,
                                })}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('BeforeContent', () => {
        it("should display default color if there's no matching status", () => {
            const {container} = render(
                <BeforeContent
                    source={fromJS({
                        status: 'foobar',
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it("should display the appropriate color if there's a matching status", () => {
            const {container} = render(
                <BeforeContent
                    source={fromJS({
                        status: 'error',
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('AfterContent', () => {
        it('should aggregate line_items by subscriptions', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({})}>
                            <AfterContent
                                isEditing={false}
                                source={fromJS({
                                    line_items: [
                                        {
                                            subscription_id: 1,
                                            title: 'foo',
                                            quantity: 7,
                                        },
                                        {
                                            subscription_id: 1,
                                            title: 'bar',
                                            quantity: 5,
                                        },
                                        {
                                            subscription_id: 2,
                                            title: 'baz',
                                            quantity: 1,
                                        },
                                    ],
                                })}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('AfterTitle', () => {
        it('should return null if we are in edition mode, or if there is no integrationId', () => {
            const {container: container1} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle
                            isEditing
                            source={fromJS({
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container1).toMatchSnapshot()

            const {container: container2} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integration: fromJS({}),
                            integrationId: undefined,
                        }}
                    >
                        <AfterTitle
                            source={fromJS({
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container2).toMatchSnapshot()
        })

        it('should display the refund action when the status is SUCCESS or PARTIALLY_REFUNDED', () => {
            const {container: container1} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle
                            source={fromJS({
                                status: 'SUCCESS',
                                total_price: '18.00',
                                total_refunds: 0.0,
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container1).toMatchSnapshot()

            const {container: container2} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle
                            source={fromJS({
                                status: 'PARTIALLY_REFUNDED',
                                total_price: '18.00',
                                total_refunds: 8.0,
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container2).toMatchSnapshot()
        })

        it('should handle correctly if total_price or total_refunds is not set', () => {
            const {container: container1} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle
                            source={fromJS({
                                status: 'SUCCESS',
                                total_price: null,
                                total_refunds: 0.0,
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container1).toMatchSnapshot()

            const {container: container2} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle
                            source={fromJS({
                                status: 'PARTIALLY_REFUNDED',
                                total_price: '18.00',
                                total_refunds: null,
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container2).toMatchSnapshot()
        })

        it('should not display the refund action when the status is not SUCCESS or PARTIALLY_REFUNDED', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle
                            source={fromJS({
                                status: 'FAILURE',
                                total_price: '18.00',
                                id: 2,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('TitleWrapper', () => {
        const integrationId = 12
        const customerId = 456
        const getIntegrationData = () =>
            fromJS({
                customer: {
                    id: customerId,
                    hash: 'asd1as2d3',
                },
            })

        const chargeData = fromJS({
            id: 789,
            customer_id: customerId,
        })
        const integrationContextData2 = {
            integrationId,
            integration: fromJS({
                id: integrationId,
                meta: {store_name: 'mystore'},
            }),
        }

        it('should not render any link because no customer hash is available', () => {
            window.location.pathname = ''

            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={integrationContextData2}
                    >
                        <Wrapper source={fromJS({})}>
                            <TitleWrapperContainer
                                getIntegrationData={() =>
                                    fromJS({
                                        customer: {},
                                    })
                                }
                                source={chargeData}
                                template={fromJS({})}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should not render any provided link when no customer hash is available', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={integrationContextData2}
                    >
                        <Wrapper source={fromJS({})}>
                            <TitleWrapperContainer
                                getIntegrationData={() =>
                                    fromJS({
                                        customer: {},
                                    })
                                }
                                source={chargeData}
                                template={fromJS({
                                    meta: {
                                        link: 'https://gorgias.io/{{customerHash}}/',
                                    },
                                })}
                            />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        describe('ticket context', () => {
            beforeEach(() => {
                window.location.pathname = '/app/ticket/'
            })

            it('should not render any link because no custom link is set', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <IntegrationContext.Provider
                            value={integrationContextData2}
                        >
                            <Wrapper source={fromJS({})}>
                                <TitleWrapperContainer
                                    getIntegrationData={getIntegrationData}
                                    source={chargeData}
                                    template={fromJS({})}
                                />
                            </Wrapper>
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should render custom link because it is set', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <IntegrationContext.Provider
                            value={integrationContextData2}
                        >
                            <Wrapper source={fromJS({})}>
                                <TitleWrapperContainer
                                    getIntegrationData={getIntegrationData}
                                    source={chargeData}
                                    template={fromJS({
                                        meta: {
                                            link: 'https://gorgias.io/{{customerHash}}/',
                                        },
                                    })}
                                />
                            </Wrapper>
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })
        })

        describe('customer context', () => {
            beforeEach(() => {
                window.location.pathname = '/app/customer/'
            })

            it('should not render any link because no custom link is set', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <IntegrationContext.Provider
                            value={integrationContextData2}
                        >
                            <Wrapper source={fromJS({})}>
                                <TitleWrapperContainer
                                    getIntegrationData={getIntegrationData}
                                    source={chargeData}
                                    template={fromJS({})}
                                />
                            </Wrapper>
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })

            it('should render custom link because it is set', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <IntegrationContext.Provider
                            value={integrationContextData2}
                        >
                            <Wrapper source={fromJS({})}>
                                <TitleWrapperContainer
                                    getIntegrationData={getIntegrationData}
                                    source={chargeData}
                                    template={fromJS({
                                        meta: {
                                            link: 'https://gorgias.io/{{customerHash}}/',
                                        },
                                    })}
                                />
                            </Wrapper>
                        </IntegrationContext.Provider>
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })
        })
    })
})
