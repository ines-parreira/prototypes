import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import {AfterTitle, BeforeContent, TitleWrapper} from '../Order'


describe('Order', () => {
    describe('<AfterTitle/>', () => {
        it('should not render because widgets are being edited', () => {
            const component = shallow((
                <AfterTitle
                    source={{}}
                    isEditing={true}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should not render because no integration id was provided', () => {
            const component = shallow((
                <AfterTitle
                    source={{}}
                    isEditing={false}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {}
            })

            expect(component).toMatchSnapshot()
        })

        it('should not display the refund action because the order was cancelled', () => {
            const component = shallow((
                <AfterTitle
                    source={fromJS({
                        id: 1,
                        total_price: 10.00
                    })}
                    isEditing={false}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    isOrderCancelled: true,
                    isOrderRefunded: false,
                    isChargeRefundable: true
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should not display the refund action because the order was refunded', () => {
            const component = shallow((
                <AfterTitle
                    source={fromJS({
                        id: 1,
                        total_price: 10.00
                    })}
                    isEditing={false}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    isOrderCancelled: false,
                    isOrderRefunded: true,
                    isChargeRefundable: true
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should not display the refund action because the charge is not refundable', () => {
            const component = shallow((
                <AfterTitle
                    source={fromJS({
                        id: 1,
                        total_price: 10.00
                    })}
                    isEditing={false}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    isOrderCancelled: false,
                    isOrderRefunded: false,
                    isChargeRefundable: false
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display the refund action', () => {
            const component = shallow((
                <AfterTitle
                    source={fromJS({
                        id: 1,
                        total_price: 10.00
                    })}
                    isEditing={false}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {
                    integrationId: 1,
                    isOrderCancelled: false,
                    isOrderRefunded: false,
                    isChargeRefundable: true
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display the refund action with its max equal to the total price of the order minus what has ' +
            'already been refunded on the associated charge', () => {
            const chargeId = 1
            const component = shallow((
                <AfterTitle
                    source={fromJS({
                        id: 1,
                        total_price: '10.00',
                        charge_id: chargeId
                    })}
                    isEditing={false}
                    getIntegrationData={() => fromJS({
                        charges: [{
                            id: chargeId,
                            total_refunds: '4.00'
                        }]
                    })}
                />
            ), {
                context: {
                    integrationId: 1,
                    isOrderCancelled: false,
                    isOrderRefunded: false,
                    isChargeRefundable: true
                }
            })

            expect(component).toMatchSnapshot()
        })
    })

    describe('<BeforeContent/>', () => {
        it('should render the total_refunds field to 0.00 because the value on the associated charge is null', () => {
            const chargeId = 1
            const component = shallow((
                <BeforeContent
                    source={fromJS({charge_status: 'success', charge_id: chargeId})}
                    getIntegrationData={() => fromJS({
                        charges: [{
                            id: chargeId,
                            total_refunds: null
                        }]
                    })}
                />
            ), {
                context: {
                    integration: fromJS({id: 1})
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should render with the total_refunds field from the associated charge', () => {
            const chargeId = 1
            const component = shallow((
                <BeforeContent
                    source={fromJS({charge_status: 'success', charge_id: chargeId})}
                    getIntegrationData={() => fromJS({
                        charges: [{
                            id: chargeId,
                            total_refunds: '5.00'
                        }]
                    })}
                />
            ), {
                context: {
                    integration: fromJS({id: 1})
                }
            })

            expect(component).toMatchSnapshot()
        })
    })

    describe('<TitleWrapper/>', () => {
        it('should not render any link because no customer hash was passed', () => {
            const component = shallow((
                <TitleWrapper
                    source={fromJS({order_id: 1})}
                    template={fromJS({})}
                    getIntegrationData={() => fromJS({})}
                />
            ), {
                context: {
                    integration: fromJS({meta: {store_name: 'storegorgias3'}})
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should render the base link because a customer hash was passed and no custom link is set', () => {
            const component = shallow((
                <TitleWrapper
                    source={fromJS({order_id: 1})}
                    template={fromJS({})}
                    getIntegrationData={() => fromJS({customer: {hash: 's8d4f6sdf4'}})}
                />
            ), {
                context: {
                    integration: fromJS({meta: {store_name: 'storegorgias3'}})
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should render the custom link because a customer hash was passed and a custom link is set', () => {
            const component = shallow((
                <TitleWrapper
                    source={fromJS({order_id: 1})}
                    template={fromJS({meta: {link: 'https://google.com/{{customerHash}}'}})}
                    getIntegrationData={() => fromJS({customer: {hash: 's8d4f6sdf4'}})}
                />
            ), {
                context: {
                    integration: fromJS({meta: {store_name: 'storegorgias3'}})
                }
            })

            expect(component).toMatchSnapshot()
        })
    })
})
