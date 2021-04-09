import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React from 'react'

import Customer from '../../yotpo/Customer.tsx'

const TitleWrapper = Customer().TitleWrapper

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render icon, points and tier because data is correct', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({
                        loyalty_statistics: {
                            point_balance: 1,
                            vip_tier_name: 'Vip',
                        },
                    })}
                ></TitleWrapper>,
                {
                    context: {
                        integration: fromJS({id: 1}),
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })
        it('should render icon, points and not tier because data is missing', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({
                        loyalty_statistics: {
                            point_balance: 1,
                        },
                    })}
                ></TitleWrapper>,
                {
                    context: {
                        integration: fromJS({id: 1}),
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })
    })
})
