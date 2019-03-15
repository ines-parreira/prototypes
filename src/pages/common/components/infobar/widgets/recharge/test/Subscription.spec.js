import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {AfterTitle, TitleWrapper} from '../Subscription'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const windowLocation = JSON.stringify(window.location)
delete window.location
window.location = JSON.parse(windowLocation)

describe('Subscription', () => {
    describe('AfterTitle', () => {
        it('should display only the cancel action because the subscription is not cancelled', () => {
            const component = shallow((
                <AfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    isSubscriptionCancelled: false,
                    integrationId: 1
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display only the activate action because the subscription is cancelled', () => {
            const component = shallow((
                <AfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    isSubscriptionCancelled: true,
                    integrationId: 1
                }
            })

            expect(component).toMatchSnapshot()
        })
    })

    describe('TitleWrapper', () => {
        let store
        let integrationId = 12
        let customerId = 456
        const customerData = {
            integrations: {
                [integrationId]: {
                    customer: {
                        id: customerId,
                        hash: 'asd1as2d3'
                    }
                }
            }
        }

        const ticketState = {ticket: fromJS({customer: customerData})}
        const customerState = {customers: fromJS({active: customerData})}
        const subscriptionData = fromJS({
            id: 789,
            customer_id: customerId
        })
        const context = {
            integration: fromJS({
                id: integrationId,
                meta: {store_name: 'mystore'}
            })
        }

        it('should not render any link because no customer hash is available', () => {
            window.location.pathname = ''

            let component = shallow((
                <TitleWrapper
                    store={mockStore({})}
                    source={subscriptionData}
                    template={fromJS({})}
                />
            ), {context}).dive()

            expect(component).toMatchSnapshot()

            component = shallow((
                <TitleWrapper
                    store={mockStore({})}
                    source={subscriptionData}
                    template={fromJS({
                        meta: {link: 'https://gorgias.io/{{customerHash}}/'}
                    })}
                />
            ), {context}).dive()

            expect(component).toMatchSnapshot()
        })

        describe('ticket context', () => {
            beforeEach(() => {
                store = mockStore(ticketState)
                window.location.pathname = '/app/ticket/'
            })

            it('should render default link because no custom link is set', () => {
                const component = shallow((
                    <TitleWrapper
                        store={store}
                        source={subscriptionData}
                        template={fromJS({})}
                    />
                ), {context}).dive()

                expect(component).toMatchSnapshot()
            })

            it('should render custom link because it is set', () => {
                const component = shallow((
                    <TitleWrapper
                        store={store}
                        source={subscriptionData}
                        template={fromJS({
                            meta: {link: 'https://gorgias.io/{{customerHash}}/'}
                        })}
                    />
                ), {context}).dive()

                expect(component).toMatchSnapshot()
            })
        })

        describe('customer context', () => {
            beforeEach(() => {
                store = mockStore(customerState)
                window.location.pathname = '/app/customer/'
            })

            it('should render default link because no custom link is set', () => {
                const component = shallow((
                    <TitleWrapper
                        store={store}
                        source={subscriptionData}
                        template={fromJS({})}
                    />
                ), {context}).dive()

                expect(component).toMatchSnapshot()
            })

            it('should render custom link because it is set', () => {
                const component = shallow((
                    <TitleWrapper
                        store={store}
                        source={subscriptionData}
                        template={fromJS({
                            meta: {link: 'https://gorgias.io/{{customerHash}}/'}
                        })}
                    />
                ), {context}).dive()

                expect(component).toMatchSnapshot()
            })
        })
    })
})
