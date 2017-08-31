import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import index, {SubscriptionAfterTitle} from './../Charge'

const BeforeContent = index().BeforeContent
const Wrapper = index().Wrapper

describe('Charge', () => {
    describe('SubscriptionAfterTitle', () => {
        it('should return null if isEditing', () => {
            const component = shallow(
                <SubscriptionAfterTitle
                    isEditing={true}
                    source={fromJS({})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should return null if there\'s no integrationId', () => {
            const component = shallow((
                <SubscriptionAfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    isChargeNotQueued: true
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should not display the skipCharge action if the charge is not queued', () => {
            const component = shallow((
                <SubscriptionAfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    isChargeNotQueued: true
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display the skipCharge action if the charge is queued', () => {
            const component = shallow((
                <SubscriptionAfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    isChargeNotQueued: false
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display the skipCharge action with the correct payload taken from the source', () => {
            const component = shallow((
                <SubscriptionAfterTitle
                    isEditing={false}
                    source={fromJS({
                        charge_id: 2,
                        subscription_id: 3
                    })}
                />
            ), {
                context: {
                    integrationId: 1,
                    isChargeNotQueued: false
                }
            })

            expect(component).toMatchSnapshot()
        })
    })

    describe('BeforeContent', () => {
        it('should display default color if there\'s no matching status', () => {
            const component = shallow(
                <BeforeContent
                    source={fromJS({
                        status: 'foobar'
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the appropriate color if there\'s a matching status', () => {
            const component = shallow(
                <BeforeContent
                    source={fromJS({
                        status: 'error'
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should aggregate line_items by subscriptions', () => {
            const component = shallow(
                <BeforeContent
                    source={fromJS({
                        line_items: [
                            {subscription_id: 1, title: 'foo', quantity: 7},
                            {subscription_id: 1, title: 'bar', quantity: 5},
                            {subscription_id: 2, title: 'baz', quantity: 1},
                        ]
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('Wrapper', () => {
        it('should set the context correctly when integration is not queued', () => {
            const component = shallow(
                <Wrapper
                    source={fromJS({
                        status: 'success'
                    })}
                >
                    <div></div>
                </Wrapper>
            )

            expect(component.instance().getChildContext().isChargeNotQueued).toEqual(true)
        })

        it('should set the context correctly when integration is queued', () => {
            const component = shallow(
                <Wrapper
                    source={fromJS({
                        id: 1,
                        status: 'queued'
                    })}
                >
                    <div></div>
                </Wrapper>
            )

            expect(component.instance().getChildContext().isChargeNotQueued).toEqual(false)
        })
    })
})
