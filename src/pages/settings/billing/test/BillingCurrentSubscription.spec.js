import React from 'react'
import renderer from 'react-test-renderer'
import {fromJS} from 'immutable'

import {BillingCurrentSubscription} from '../BillingCurrentSubscription'

describe('BillingCurrentSubscription component', () => {
    it('should render empty', () => {
        const component = renderer.create(
            <BillingCurrentSubscription currentSubscription={fromJS({})}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('should render active', () => {
        const component = renderer.create(
            <BillingCurrentSubscription currentSubscription={fromJS({
                status: 'active',
                created_datetime: '2017-10-10',
                trial_end_datetime: '2017-11-10'
            })}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('should render trialing', () => {
        const component = renderer.create(
            <BillingCurrentSubscription currentSubscription={fromJS({
                status: 'trialing',
                created_datetime: '2017-10-10',
                trial_end_datetime: '2017-11-10'
            })}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
})
