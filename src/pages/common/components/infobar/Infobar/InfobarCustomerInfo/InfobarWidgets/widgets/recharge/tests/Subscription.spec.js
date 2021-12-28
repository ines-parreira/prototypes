import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationContext} from '../../IntegrationContext.ts'
import {AfterTitle, TitleWrapperContainer, Wrapper} from '../Subscription.tsx'

const mockStore = configureMockStore([thunk])
const integrationContextData = {integration: fromJS({}), integrationId: 1}

describe('Subscription', () => {
    describe('AfterTitle', () => {
        it('should display only the cancel action because the subscription is not cancelled', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({cancelled_at: false})}>
                            <AfterTitle isEditing={false} source={fromJS({})} />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display only the activate action because the subscription is cancelled', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <Wrapper source={fromJS({cancelled_at: true})}>
                            <AfterTitle isEditing={false} source={fromJS({})} />
                        </Wrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('TitleWrapper', () => {
        let integrationId = 12
        let customerId = 456
        const getIntegrationData = () =>
            fromJS({
                customer: {
                    id: customerId,
                    hash: 'asd1as2d3',
                },
            })

        const subscriptionData = fromJS({
            id: 789,
            customer_id: customerId,
            address_id: 101112,
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
                                source={subscriptionData}
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
                                source={subscriptionData}
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

            it('should render default link because no custom link is set', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <IntegrationContext.Provider
                            value={integrationContextData2}
                        >
                            <Wrapper source={fromJS({})}>
                                <TitleWrapperContainer
                                    getIntegrationData={getIntegrationData}
                                    source={subscriptionData}
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
                                    source={subscriptionData}
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

            it('should render default link because no custom link is set', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <IntegrationContext.Provider
                            value={integrationContextData2}
                        >
                            <Wrapper source={fromJS({})}>
                                <TitleWrapperContainer
                                    getIntegrationData={getIntegrationData}
                                    source={subscriptionData}
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
                                    source={subscriptionData}
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
