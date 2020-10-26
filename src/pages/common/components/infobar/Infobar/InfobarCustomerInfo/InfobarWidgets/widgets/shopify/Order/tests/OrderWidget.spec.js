import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React from 'react'

import OrderWidget from '../OrderWidget'

describe('<AfterTitle/>', () => {
    const {AfterTitle} = OrderWidget()
    let defaultSource = {
        fulfillment_status: null,
        financial_status: 'pending',
        total_price_set: {
            presentment_money: {
                amount: 10,
                currency_code: 'USD',
            },
        },
        created_at: '2020-10-19T09:03:49-04:00',
    }
    let context = {
        integrationId: 1,
        isOrderCancelled: false,
        isOrderRefunded: false,
        isOrderFulfilled: false,
        isOrderPartiallyFulfilled: false,
    }

    it('should display order price details from total_price_set source.', () => {
        const component = shallow(
            <AfterTitle source={fromJS(defaultSource)} />,
            {
                context: context,
            }
        )

        expect(component).toMatchSnapshot()
    })
    it(
        'should display order price details from current_total_price_set if the field is presented in source.' +
            '(Field should be presented in case the order was updated on Shopify.)',
        () => {
            const component = shallow(
                <AfterTitle
                    source={fromJS({
                        ...defaultSource,
                        current_total_price_set: {
                            presentment_money: {
                                amount: 1,
                                currency_code: 'EUR',
                            },
                        },
                    })}
                />,
                {
                    context: context,
                }
            )

            expect(component).toMatchSnapshot()
        }
    )
})
