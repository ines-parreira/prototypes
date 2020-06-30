import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {Plan} from '../Plan'
import {billingState} from '../../../../../fixtures/billing'

describe('Plan component', () => {
    it('should render', () => {
        const plan = fromJS(billingState.plans.free)
        const wrapper = shallow(<Plan plan={plan} />)

        expect(wrapper.dive()).toMatchSnapshot()
    })

    it('should truncate cost_per_ticket', () => {
        const plan = fromJS({
            ...billingState.plans['standard-1'],
            currencySign: '$',
            /** @see https://floating-point-gui.de/ */
            cost_per_ticket: 0.7 * 0.1, // 0.06999999999999999
        })

        const wrapper = shallow(<Plan plan={plan} />)

        expect(wrapper.render().text()).toContain('+ $7.00 per 100 tickets')
    })
})
