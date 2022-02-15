import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {fromJS, Map} from 'immutable'
import MockDate from 'mockdate'

import thunk from 'redux-thunk'

import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/types'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import GorgiasChatIntegrationSelfService from '..'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('models/selfServiceConfiguration/resources', () => ({
    fetchSelfServiceConfiguration: (id: any): SelfServiceConfiguration => ({
        id,
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
        quick_response_policies: [],
    }),
}))

jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn().mockResolvedValue({}),
}))

describe('<GorgiasChatIntegrationSelfService/>', () => {
    const date = '2021-01-24T17:30:00.000Z'

    beforeEach(() => {
        jest.resetAllMocks()
        MockDate.set(date)
    })

    afterEach(() => {
        jest.clearAllMocks()
        MockDate.reset()
    })

    const defaultState = {
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

    const props = {
        integration: fromJS({
            id: 7,
            name: 'my chat integration',
            type: IntegrationType.GorgiasChat,
            meta: {
                shop_name: 'totoshop',
            },
        }) as Map<any, any>,
    }

    describe('render()', () => {
        it('should render the self service tab', () => {
            const {container, getByText} = render(
                <Provider store={mockStore({...defaultState})}>
                    <GorgiasChatIntegrationSelfService {...props} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()

            fireEvent.click(getByText('Enable self-service for this chat'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: 7,
                    name: 'my chat integration',
                    type: 'gorgias_chat',
                    meta: fromJS({
                        shop_name: 'totoshop',
                        self_service_deactivated_datetime: date,
                    }),
                })
            )
        })
    })
})
