import React, {ComponentProps} from 'react'
import {act, render} from '@testing-library/react'
import {fromJS, List} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {AUTOMATION_OVERVIEW, stats as statsConfig} from '../../../config/stats'

import {AutomationStatsSelfServiceMetric} from '../AutomationStatsSelfServiceMetric'
import {RootState, StoreDispatch} from '../../../state/types'
import {SelfServiceConfiguration} from '../../../models/selfServiceConfiguration/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomationStatsSelfServiceMetric />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    const data = fromJS([
        {
            delta: 100,
            more_is_better: true,
            name: 'automated_via_selfservice',
            type: 'percent',
            value: 25,
        },
    ])
    const metricConfig = (
        statsConfig.get(AUTOMATION_OVERVIEW).get('metrics') as List<any>
    ).get(2)

    const minProps: ComponentProps<typeof AutomationStatsSelfServiceMetric> = {
        index: 2,
        loading: false,
        data,
        meta: fromJS({}),
        metricConfig,
        id: 'automated_via_selfservice-2',
    }

    const afterAddonLaunch = '2021-11-01T00:00:00Z'
    const beforeAddonLaunch = '2021-01-01T00:00:00Z'

    const defaultState = {
        currentAccount: fromJS({created_datetime: afterAddonLaunch}),
        entities: {
            macros: {},
            rules: {},
            ruleRecipes: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenters: {},
            selfServiceConfigurations: {},
            phoneNumbers: {},
        },
    }

    const selfServiceConfiguration: SelfServiceConfiguration = {
        id: 1,
        type: 'shopify',
        shop_name: 'my-shop',
        created_datetime: '2019-11-15 19:00:00.000000',
        updated_datetime: '2019-11-15 19:00:00.000000',
        deactivated_datetime: null,
        report_issue_policy: {
            enabled: true,
            cases: [],
        },
        track_order_policy: {
            enabled: true,
        },
        cancel_order_policy: {
            enabled: true,
        },
        return_order_policy: {
            enabled: true,
        },
    }

    type state = Parameters<typeof mockStore>[0]
    it.each<[string, state]>([
        ['paywall', defaultState],
        [
            'setup and paywall',
            {
                ...defaultState,
                currentAccount: fromJS({created_datetime: beforeAddonLaunch}),
            },
        ],
        [
            'stats and paywall',
            {
                ...defaultState,
                currentAccount: fromJS({created_datetime: beforeAddonLaunch}),
                entities: {
                    ...defaultState.entities,
                    selfServiceConfigurations: {'0': selfServiceConfiguration},
                },
            },
        ],
        [
            'setup',
            {
                ...defaultState,
                currentAccount: fromJS({
                    created_datetime: afterAddonLaunch,
                    current_subscription: {plan: 'AutomationAddon'},
                }),
                billing: fromJS({
                    plans: fromJS({
                        ['AutomationAddon']: {automation_addon_included: true},
                    }),
                }),
            },
        ],
        [
            'stats',
            {
                currentAccount: fromJS({
                    created_datetime: afterAddonLaunch,
                    current_subscription: {plan: 'AutomationAddon'},
                }),
                entities: {
                    ...defaultState.entities,
                    selfServiceConfigurations: {'0': selfServiceConfiguration},
                },
                billing: fromJS({
                    plans: fromJS({
                        ['AutomationAddon']: {automation_addon_included: true},
                    }),
                }),
            },
        ],
    ])('should render %s', (_, state) => {
        act(() => {
            const {container} = render(
                <Provider store={mockStore(state)}>
                    <AutomationStatsSelfServiceMetric {...minProps} />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
