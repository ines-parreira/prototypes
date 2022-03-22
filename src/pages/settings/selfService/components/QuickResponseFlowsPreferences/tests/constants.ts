import {fromJS} from 'immutable'

import {ShopType} from 'models/selfServiceConfiguration/types'
import {billingState} from 'fixtures/billing'
import {basicPlan} from 'fixtures/subscriptionPlan'
import {account} from 'fixtures/account'

import {getEquivalentAutomationPlanId} from 'models/billing/utils'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

const automationPlanId = getEquivalentAutomationPlanId(basicPlan.id)

export const defaultState = {
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            plan: automationPlanId,
            status: 'active',
        },
    }),
    billing: fromJS({
        ...billingState,
        plans: fromJS({
            [basicPlan.id]: basicPlan,
            [automationPlanId]: {
                ...basicPlan,
                id: automationPlanId,
                amount: basicPlan.amount + 2000,
                automation_addon_included: true,
            },
        }),
    }),
    entities: {
        auditLogEvents: {},
        macros: {},
        rules: {},
        ruleRecipes: {},
        sections: {},
        stats: {},
        tags: {},
        views: {},
        viewsCount: {},
        helpCenter: helpCenterInitialState,
        selfServiceConfigurations: {
            1: {
                id: 1,
                type: 'shopify' as ShopType,
                shop_name: `mystore1`,
                created_datetime: '2021-01-26T00:29:00Z',
                updated_datetime: '2021-01-26T00:29:30Z',
                deactivated_datetime: '2021-01-26T00:30:00Z',
                report_issue_policy: {
                    enabled: true,
                    cases: [],
                },
                track_order_policy: {
                    enabled: true,
                },
                cancel_order_policy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
                return_order_policy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
                quick_response_policies: [
                    {title: 'First', deactivated_datetime: null},
                    {title: 'Second', deactivated_datetime: null},
                    {title: 'Third', deactivated_datetime: null},
                    {title: 'Fourth', deactivated_datetime: null},
                    {
                        title: 'Fifth',
                        deactivated_datetime: '2020-01-01T00:00:00Z',
                    },
                ],
            },
        },
        phoneNumbers: {},
    },
    integrations: fromJS({
        integrations: fromJS([
            {
                id: 1,
                type: 'shopify',
                meta: {
                    shop_name: `mystore1`,
                },
                uri: `/api/integrations/1/`,
            },
        ]),
    }),
}
