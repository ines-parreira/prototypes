import {screen} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/productPrices'

import {IntegrationType} from 'models/integration/constants'
import StatsNavbarView, {
    BUSIEST_TIMES_OF_DAYS_NAV_LABEL,
} from 'pages/stats/common/components/StatsNavbarView'
import {SERVICE_LEVEL_AGREEMENT_PAGE_TITLE} from 'pages/stats/sla/ServiceLevelAgreements'
import {AUTO_QA_PAGE_TITLE} from 'pages/stats/support-performance/auto-qa/AutoQA'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

function getIntegration(id: number, type: IntegrationType) {
    return {
        id,
        type,
        name: `My Phone Integration ${id}`,
        meta: {
            emoji: '',
            phone_number_id: id,
        },
    }
}

describe('StatsNavbarView', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
    }

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsAutoQA]: false,
        })
    })

    it('should render', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the link to new busiest times of days', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(
            screen.getByText(BUSIEST_TIMES_OF_DAYS_NAV_LABEL)
        ).toBeInTheDocument()
    })

    describe('New Agents Performance', () => {
        it('should render the link to new agents page when having flag enabled', () => {
            renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <DndProvider backend={HTML5Backend}>
                        <StatsNavbarView />
                    </DndProvider>
                </Provider>
            )

            const agentsPerformanceLink = screen
                .getAllByRole('link', {name: new RegExp('Agents')})
                .find(
                    (el) =>
                        el.getAttribute('href') ===
                        '/app/stats/support-performance-agents'
                )

            expect(agentsPerformanceLink).toBeInTheDocument()
        })
    })

    it('should render the link to the Convert Campaigns', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })

    it('should render the link to the Help Center Stats when having access to the feature', () => {
        mockFlags({
            [FeatureFlagKey.HelpCenterAnalytics]: true,
        })
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText('Help Center')).toBeInTheDocument()
    })

    it('should render the link to the Voice Overview', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(screen.getAllByText('Voice')).toHaveLength(2)
        expect(screen.getAllByText('Agents')).toHaveLength(3)
    })

    it('should render the link to the Service Level Agreements', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(
            screen.getByText(SERVICE_LEVEL_AGREEMENT_PAGE_TITLE)
        ).toBeInTheDocument()
    })

    it.each([UserRole.Admin, UserRole.Agent])(
        'should render the link to the Auto QA',
        (role) => {
            const state = {
                ...defaultState,
                currentUser: fromJS({
                    role: {name: role},
                }) as Map<any, any>,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.price_id,
                        },
                    },
                }),
            }
            mockFlags({
                [FeatureFlagKey.AnalyticsAutoQA]: true,
            })

            renderWithRouter(
                <Provider store={mockStore(state)}>
                    <DndProvider backend={HTML5Backend}>
                        <StatsNavbarView />
                    </DndProvider>
                </Provider>
            )

            expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        }
    )

    it('should render the link to the Old Tags Report Page when NewTagsReport is disabled', () => {
        mockFlags({
            [FeatureFlagKey.NewTagsReport]: false,
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        const TagsReportLink = container.querySelector(
            'a[href="/app/stats/tags"]'
        )
        const newBadgeText = TagsReportLink?.children?.[0]?.innerHTML

        expect(TagsReportLink).toBeInTheDocument()
        expect(newBadgeText).toBeUndefined()
    })

    it('should render the link to the New Tags Report page when NewTagsReport is enabled', () => {
        mockFlags({
            [FeatureFlagKey.NewTagsReport]: true,
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        const TagsReportLink = container.querySelector(
            'a[href="/app/stats/tags"]'
        )
        const newBadgeText = TagsReportLink?.children?.[0]?.innerHTML

        expect(TagsReportLink).toBeInTheDocument()
        expect(newBadgeText).toBe('NEW')
    })

    it('should render the link to the New Channels Reports', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )
        const newChannelsReportLink = container.querySelector(
            'a[href="/app/stats/channels"]'
        )
        expect(newChannelsReportLink).toBeInTheDocument()
    })

    it('should render the link to the New Satisfaction Report', () => {
        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )
        const newSatisfactionReportLink = container.querySelector(
            'a[href="/app/stats/quality-management-satisfaction"]'
        )
        const newBadgeText = newSatisfactionReportLink?.children?.[0]?.innerHTML

        expect(newSatisfactionReportLink).toBeInTheDocument()
        expect(newBadgeText).toBe('NEW')
    })

    it('should render the link to the Live Voice', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        const liveVoiceLink = container.querySelector(
            'a[href="/app/stats/live-voice"]'
        )
        expect(liveVoiceLink).toBeInTheDocument()
    })
})
