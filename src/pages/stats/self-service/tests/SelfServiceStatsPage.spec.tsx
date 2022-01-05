import React from 'react'
import {act, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from '../../../../state/types'
import SelfServiceStatsPage from '../SelfServiceStatsPage'
import {proPlan} from '../../../../fixtures/subscriptionPlan'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../../../models/selfServiceConfiguration/resources', () => ({
    fetchSelfServiceConfigurations: jest.fn(() => Promise.resolve([])),
}))

describe('<SelfServiceStatsPage />', () => {
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
            helpCenters: {},
            helpCenterArticles: {},
            selfServiceConfigurations: {},
            phoneNumbers: {},
        },
        integrations: fromJS({}),
    }
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should display the loader on loading', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: fromJS({
                            plan: proPlan.id,
                        }),
                        features: {
                            ...proPlan.features,
                        },
                    }),
                })}
            >
                <SelfServiceStatsPage />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the automation add-on upgrade paywall if the current account doesnt have the feature', () => {
        act(() => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            current_subscription: fromJS({
                                plan: proPlan.id,
                            }),
                            features: {
                                ...proPlan.features,
                            },
                        }),
                    })}
                >
                    <SelfServiceStatsPage />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
