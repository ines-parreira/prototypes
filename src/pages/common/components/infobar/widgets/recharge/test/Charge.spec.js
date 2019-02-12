import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import index, {SubscriptionAfterTitle, AfterContent, AfterTitle} from './../Charge'

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
                    chargeStatus: 'success'
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should not display any action if the charge is nor queued nor skipped', () => {
            const component = shallow((
                <SubscriptionAfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    chargeStatus: 'success'
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display the skipCharge action if the charge is queued', () => {
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
                    chargeStatus: 'queued'
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display the unskipCharge action if the charge is skipped', () => {
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
                    chargeStatus: 'skipped'
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
    })

    describe('AfterContent', () => {
        it('should aggregate line_items by subscriptions', () => {
            const component = shallow(
                <AfterContent
                    isEditing={false}
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
        it('should set the context correctly', () => {
            const component = shallow(
                <Wrapper
                    source={fromJS({
                        status: 'success'
                    })}
                >
                    <div></div>
                </Wrapper>
            )

            expect(component.instance().getChildContext().chargeStatus).toEqual('success')
        })
    })

    describe('AfterTitle', () => {
        const options = {context: {integrationId: 1}}

        it('should return null if we are in edition mode, or if there is no integrationId', () => {
            let component = shallow(
                <AfterTitle
                    isEditing={true}
                    source={fromJS({})}
                />
            , options)

            expect(component).toMatchSnapshot()

            component = shallow(
                <AfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            , {context: {integrationId: null}})

            expect(component).toMatchSnapshot()
        })

        it('should display the refund action when the status is SUCCESS or PARTIALLY_REFUNDED', () => {
            let component = shallow(
                <AfterTitle
                    isEditing={false}
                    source={fromJS({
                        status: 'SUCCESS',
                        total_price: '18.00',
                        total_refunds: 0.00
                    })}
                />
            , options)

            expect(component).toMatchSnapshot()

            component = shallow(
                <AfterTitle
                    isEditing={false}
                    source={fromJS({
                        status: 'PARTIALLY_REFUNDED',
                        total_price: '18.00',
                        total_refunds: 8.00
                    })}
                />
            , options)

            expect(component).toMatchSnapshot()
        })

        it('should handle correctly if total_price or total_refunds is not set', () => {
            let component = shallow(
                <AfterTitle
                    isEditing={false}
                    source={fromJS({
                        status: 'SUCCESS',
                        total_price: null,
                        total_refunds: 0.00
                    })}
                />
            , options)

            expect(component).toMatchSnapshot()

            component = shallow(
                <AfterTitle
                    isEditing={false}
                    source={fromJS({
                        status: 'PARTIALLY_REFUNDED',
                        total_price: '18.00',
                        total_refunds: null
                    })}
                />
            , options)

            expect(component).toMatchSnapshot()
        })

        it('should not display the refund action when the status is not SUCCESS or PARTIALLY_REFUNDED', () => {
            const component = shallow(
                <AfterTitle
                    isEditing={false}
                    source={fromJS({
                        status: 'FAILURE',
                        total_price: '18.00'
                    })}
                />
            , options)

            expect(component).toMatchSnapshot()
        })
    })
})
