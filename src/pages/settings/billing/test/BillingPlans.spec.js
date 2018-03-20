import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingPlans} from '../plans/BillingPlans'

describe('BillingPlans component', () => {
    it('should load with empty props', () => {
        const component = mount(
            <BillingPlans
                notify={() => true}
                updateSubscription={() => true}
                isAllowedToChangePlan={() => true}
                plans={fromJS({})}
                subscription={fromJS({plan: 'some-plan'})}
                currentPlan={fromJS({})}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display matching current plan', () => {
        const component = shallow(
            <BillingPlans
                notify={() => true}
                updateSubscription={() => true}
                isAllowedToChangePlan={() => true}
                plans={fromJS({
                    plan1: {
                        public: true,
                        name: 'my plan',
                        free_tickets: 100,
                        currencySign: '$',
                        integrations: 10
                    }
                })}
                subscription={fromJS({plan: 'plan1'})}
                currentPlan={fromJS({})}
            />
        )
        expect(component).toMatchSnapshot()
    })


    it('should display multiple plans', () => {
        const component = shallow(
            <BillingPlans
                notify={() => true}
                updateSubscription={() => true}
                isAllowedToChangePlan={() => true}
                plans={fromJS({
                    plan1: {
                        public: true,
                        name: 'my plan',
                        free_tickets: 100,
                        currencySign: '$',
                        integrations: 10
                    },
                    plan2: {
                        public: true,
                        name: 'my second plan',
                        free_tickets: 1000,
                        currencySign: '$',
                        integrations: 100
                    },
                    hidden: {
                        public: false,
                        name: 'my hidden plan',
                        free_tickets: 1000,
                        currencySign: '$',
                        integrations: 100
                    }
                })}
                subscription={fromJS({plan: 'plan1'})}
                currentPlan={fromJS({})}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display a custom plan', () => {
        const component = shallow(
            <BillingPlans
                notify={() => true}
                updateSubscription={() => true}
                isAllowedToChangePlan={() => true}
                plans={fromJS({
                    custom: {
                        public: true,
                        name: 'custom plan',
                        free_tickets: 100,
                        currencySign: '$',
                        integrations: 10
                    },
                    plan1: {
                        public: true,
                        name: 'plan 1',
                        free_tickets: 100,
                        currencySign: '$',
                        integrations: 10
                    }
                })}
                subscription={fromJS({plan: 'custom'})}
                currentPlan={fromJS({custom: true})}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
