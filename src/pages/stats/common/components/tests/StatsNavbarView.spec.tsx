import React from 'react'
import configureMockStore from 'redux-mock-store'
import LD from 'launchdarkly-react-client-sdk'
import thunk from 'redux-thunk'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {FeatureFlagKey} from 'config/featureFlags'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

import {IntegrationType} from 'models/integration/constants'
import StatsNavbarView from '../StatsNavbarView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

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

    it('should render the link to busiest times of days', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText('Busiest times of days')).toBeInTheDocument()
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

    it('should render the link to the Revenue Campaign when having access to the beta', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.RevenueBetaTesters]: true,
        }))
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.HelpCenterAnalytics]: true,
        }))
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText('Help Center')).toBeInTheDocument()
    })

    it('should render the link to the Voice Overview (FF on)', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.DisplayVoiceAnalyticsV1]: true,
        }))
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <StatsNavbarView />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText('Voice')).toBeInTheDocument()
        expect(screen.getAllByText('Agents')).toHaveLength(3)
    })
})
