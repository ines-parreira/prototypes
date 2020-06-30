import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingUsage} from '../BillingUsage'

describe('BillingUsage component', () => {
    let container
    let currentPlan = fromJS({
        name: 'Pro',
        free_tickets: 10,
        integrations: 5,
        interval: 'month',
    })
    let currentSubscription = fromJS({
        start_datetime: '2018-01-01T10:10:10.480Z',
    })
    let activeIntegrations = fromJS([])

    beforeEach(() => {
        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        container = document.createElement('div')
        document.body.appendChild(container)
    })

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
                currentPlan={currentPlan}
                currentSubscription={currentSubscription}
                activeIntegrations={activeIntegrations}
                currentUsage={fromJS({
                    meta: {
                        start_datetime: '2010-10-10',
                        end_datetime: '2010-10-11',
                    },
                })}
                fetchCurrentUsage={() => Promise.resolve()}
            />,
            {attachTo: container}
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display price', () => {
        const component = mount(
            <BillingUsage
                currentPlan={currentPlan}
                currentSubscription={currentSubscription}
                currentUsage={fromJS({
                    meta: {
                        start_datetime: '2010-10-10',
                        end_datetime: '2010-10-11',
                    },
                    data: {
                        cost: 10,
                        tickets: 20,
                    },
                })}
                fetchCurrentUsage={() => Promise.resolve()}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
