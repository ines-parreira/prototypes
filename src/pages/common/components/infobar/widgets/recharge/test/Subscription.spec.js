import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {AfterTitle} from '../Subscription'
import {TitleWrapper} from '../Subscription'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

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

        beforeEach(() => {
            store = mockStore({
                ticket: fromJS({
                    customer: {
                        integrations: {
                            [integrationId]: {
                                customer: {
                                    id: customerId,
                                    hash: 'asd1as2d3'
                                }
                            }
                        }
                    }
                })
            })
        })

        it('should render', () => {
            const component = shallow((
                <TitleWrapper
                    store={store}
                    source={fromJS({
                        id: 789,
                        customer_id: customerId
                    })}
                />
            ), {
                context: {
                    integration: fromJS({
                        id: integrationId,
                        meta: {store_name: 'mystore'}
                    })
                }
            }).dive()

            expect(component).toMatchSnapshot()
        })
    })
})
