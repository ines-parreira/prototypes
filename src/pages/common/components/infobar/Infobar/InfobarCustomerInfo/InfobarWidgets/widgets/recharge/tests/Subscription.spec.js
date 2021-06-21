import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {AfterTitle, TitleWrapperContainer} from '../Subscription.tsx'

describe('Subscription', () => {
    describe('AfterTitle', () => {
        it('should display only the cancel action because the subscription is not cancelled', () => {
            const component = shallow(
                <AfterTitle isEditing={false} source={fromJS({})} />,
                {
                    context: {
                        isSubscriptionCancelled: false,
                        integrationId: 1,
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })

        it('should display only the activate action because the subscription is cancelled', () => {
            const component = shallow(
                <AfterTitle isEditing={false} source={fromJS({})} />,
                {
                    context: {
                        isSubscriptionCancelled: true,
                        integrationId: 1,
                    },
                }
            )

            expect(component).toMatchSnapshot()
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
        const context = {
            integration: fromJS({
                id: integrationId,
                meta: {store_name: 'mystore'},
            }),
        }

        it('should not render any link because no customer hash is available', () => {
            window.location.pathname = ''

            let component = shallow(
                <TitleWrapperContainer
                    getIntegrationData={() =>
                        fromJS({
                            customer: {},
                        })
                    }
                    source={subscriptionData}
                    template={fromJS({})}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should not render any provided link when no customer hash is available', () => {
            const component = shallow(
                <TitleWrapperContainer
                    getIntegrationData={() =>
                        fromJS({
                            customer: {},
                        })
                    }
                    source={subscriptionData}
                    template={fromJS({
                        meta: {link: 'https://gorgias.io/{{customerHash}}/'},
                    })}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        describe('ticket context', () => {
            beforeEach(() => {
                window.location.pathname = '/app/ticket/'
            })

            it('should render default link because no custom link is set', () => {
                const component = shallow(
                    <TitleWrapperContainer
                        getIntegrationData={getIntegrationData}
                        source={subscriptionData}
                        template={fromJS({})}
                    />,
                    {context}
                )

                expect(component).toMatchSnapshot()
            })

            it('should render custom link because it is set', () => {
                const component = shallow(
                    <TitleWrapperContainer
                        getIntegrationData={getIntegrationData}
                        source={subscriptionData}
                        template={fromJS({
                            meta: {
                                link: 'https://gorgias.io/{{customerHash}}/',
                            },
                        })}
                    />,
                    {context}
                )

                expect(component).toMatchSnapshot()
            })
        })

        describe('customer context', () => {
            beforeEach(() => {
                window.location.pathname = '/app/customer/'
            })

            it('should render default link because no custom link is set', () => {
                const component = shallow(
                    <TitleWrapperContainer
                        getIntegrationData={getIntegrationData}
                        source={subscriptionData}
                        template={fromJS({})}
                    />,
                    {context}
                )

                expect(component).toMatchSnapshot()
            })

            it('should render custom link because it is set', () => {
                const component = shallow(
                    <TitleWrapperContainer
                        getIntegrationData={getIntegrationData}
                        source={subscriptionData}
                        template={fromJS({
                            meta: {
                                link: 'https://gorgias.io/{{customerHash}}/',
                            },
                        })}
                    />,
                    {context}
                )

                expect(component).toMatchSnapshot()
            })
        })
    })
})
