import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import SelfServiceFlowSelect from '../SelfServiceFlowSelect'
import {SelfServiceConfigurationsState} from '../../../../../../state/entities/selfServiceConfigurations/types'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../../../models/selfServiceConfiguration/types'
import {initialState as helpCenterInitialState} from '../../../../../../state/entities/helpCenter/reducer'

const mockStore = configureMockStore([thunk])

const createSelfServiceConfigurationFixtures = (
    length: number
): SelfServiceConfiguration[] => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify' as ShopType,
        shop_name: `mystore${i + 1}`,
        created_datetime: '2021-01-26T00:29:00Z',
        updated_datetime: '2021-01-26T00:29:30Z',
        deactivated_datetime: i % 2 === 0 ? null : '2021-01-26T00:30:00Z',
        report_issue_policy: {
            enabled: false,
            cases: [],
        },
        track_order_policy: {
            enabled: false,
        },
        cancel_order_policy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        return_order_policy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        quick_response_policies: [],
    }))
}

const minProps: ComponentProps<typeof SelfServiceFlowSelect> = {
    value: null,
    onChange: _noop,
    flowType: 'order-management',
}

describe('<SelfServiceFlowSelect />', () => {
    const defaultState = {
        billing: fromJS({plans: []}),
        currentAccount: fromJS({
            features: {
                automation_return_flow: {enabled: true},
                automation_cancellations_flow: {enabled: true},
                automation_track_order_flow: {enabled: true},
                automation_report_issue_flow: {enabled: true},
            },
            created_datetime: '2021-08-01T00:00:00Z',
        }),
        entities: {
            macros: {},
            rules: {},
            ruleRecipes: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenter: helpCenterInitialState,
            helpCenterArticles: {},
            selfServiceConfigurations: {},
            phoneNumbers: {},
            auditLogEvents: {},
        },
        integrations: fromJS({}),
    }

    it('should render component with no selected items', () => {
        const selfServiceConfigurations =
            createSelfServiceConfigurationFixtures(3)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: {
                        ...defaultState.entities,
                        selfServiceConfigurations:
                            selfServiceConfigurations.reduce(
                                (
                                    configurations: SelfServiceConfigurationsState,
                                    configuration: SelfServiceConfiguration
                                ) => ({
                                    ...configurations,
                                    [configuration.id]: configuration,
                                }),
                                {} as Partial<SelfServiceConfiguration>
                            ),
                    },
                })}
            >
                <SelfServiceFlowSelect {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render component with selected item', () => {
        const selfServiceConfigurations =
            createSelfServiceConfigurationFixtures(3)
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: {
                        ...defaultState.entities,
                        selfServiceConfigurations:
                            selfServiceConfigurations.reduce(
                                (
                                    configurations: SelfServiceConfigurationsState,
                                    configuration: SelfServiceConfiguration
                                ) => ({
                                    ...configurations,
                                    [configuration.id]: configuration,
                                }),
                                {} as Partial<SelfServiceConfiguration>
                            ),
                    },
                })}
            >
                <SelfServiceFlowSelect
                    {...minProps}
                    value={'reasonIncorrectItems'}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
