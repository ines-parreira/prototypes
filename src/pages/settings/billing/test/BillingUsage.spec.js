import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingUsage} from '../BillingUsage'

describe('BillingUsage component', () => {
    it('should display loader', () => {
        const component = mount(
            <BillingUsage
                currentUsage={fromJS({})}
                fetchCurrentUsage={() => Promise.resolve()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should load with empty props', () => {
        const component = mount(
            <BillingUsage
                currentUsage={fromJS({
                    meta: {
                        start_datetime: '2010-10-10',
                        end_datetime: '2010-10-11'
                    },
                })}
                fetchCurrentUsage={() => Promise.resolve()}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display price', () => {
        const component = mount(
            <BillingUsage
                currentUsage={fromJS({
                    meta: {
                        start_datetime: '2010-10-10',
                        end_datetime: '2010-10-11'
                    },
                    data: {
                        cost: 10,
                        extra_tickets: 10
                    }
                })}
                fetchCurrentUsage={() => Promise.resolve()}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
