import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingUsage} from '../BillingUsage'
import {account} from '../../../../fixtures/account.ts'

jest.mock('../../../common/components/LegacyPlanBanner', () => () => (
    <div>Legacy Plan Banner Mock</div>
))

describe('<BillingUsage/>', () => {
    let container
    const currentAccount = fromJS(account)
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
    window.GORGIAS_SUPPORT_EMAIL = 'support@gorgias.com'

    let accountHasLegacyPlan =
        !!currentAccount.getIn(['meta', 'has_legacy_features'], false) ||
        (!currentPlan.get('public') && !currentPlan.get('custom'))

    beforeEach(() => {
        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    it('should display loader', () => {
        const component = mount(
            <BillingUsage
                currentAccount={fromJS({})}
                currentUsage={fromJS({})}
                fetchCurrentUsage={() => Promise.resolve()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should load with empty props', () => {
        const component = mount(
            <BillingUsage
                currentAccount={currentAccount}
                currentPlan={currentPlan}
                currentSubscription={currentSubscription}
                activeIntegrations={activeIntegrations}
                accountHasLegacyPlan={accountHasLegacyPlan}
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
                currentAccount={currentAccount}
                currentPlan={currentPlan}
                currentSubscription={currentSubscription}
                accountHasLegacyPlan={accountHasLegacyPlan}
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
