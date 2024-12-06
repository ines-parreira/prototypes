import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {user} from 'fixtures/users'
import {IntegrationType} from 'models/integration/types'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import useContactFormFlag from 'pages/convert/common/hooks/useContactFormFlag'
import {useIsOverviewPageEnabled} from 'pages/convert/common/hooks/useIsOverviewPageEnabled'
import {RootState} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {ThemeProvider} from 'theme'
import {assumeMock} from 'utils/testing'

import ConvertNavbar from '../ConvertNavbar'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('react-router')

jest.mock('pages/convert/common/hooks/useIsOverviewPageEnabled')
const useIsOverviewPageEnabledSpy = assumeMock(useIsOverviewPageEnabled)

jest.mock('pages/common/hooks/useIsConvertSubscriber')

jest.mock('pages/convert/channelConnections/hooks/useGetOnboardingStatusMap')

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('pages/convert/common/hooks/useContactFormFlag')

const mockUseContactFormFlag = assumeMock(useContactFormFlag)

const useGetOnboardingStatusMapSpy = assumeMock(useGetOnboardingStatusMap)

const isConvertSubscriberMock = useIsConvertSubscriber as jest.Mock

const mockStore = configureMockStore()

const queryClient = mockQueryClient()

describe('<ConvertNavbar />', () => {
    const defaultState: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS({integrations: []}),
    }
    const integration = {
        id: 99,
        name: 'convertgorgiastestchat',
        deleted_datetime: null,
        deactivated_datetime: null,
        type: 'gorgias_chat',
        meta: {
            app_id: '101',
            shop_type: IntegrationType.Shopify,
            shop_integration_id: shopifyIntegration.id,
        },
    }
    const integrations = (fromJS(integrationsState) as Map<any, any>).mergeIn(
        ['integrations'],
        fromJS([integration, shopifyIntegration])
    )

    beforeEach(() => {
        useGetOnboardingStatusMapSpy.mockReturnValue({
            onboardingMap: {'101': true},
            isLoading: false,
            isError: false,
        })
        mockUseContactFormFlag.mockReturnValue(false)
    })

    describe('render()', () => {
        it('should render overview tab when ff is enabled', () => {
            useIsOverviewPageEnabledSpy.mockReturnValue(true)
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <ThemeProvider>
                        <ConvertNavbar />
                    </ThemeProvider>
                </Provider>
            )

            expect(queryByText('Overview')).toBeInTheDocument()
        })

        it('should not render overview tab when ff is disabled', () => {
            useIsOverviewPageEnabledSpy.mockReturnValue(false)
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <ThemeProvider>
                        <ConvertNavbar />
                    </ThemeProvider>
                </Provider>
            )

            expect(queryByText('Overview')).not.toBeInTheDocument()
        })

        it('should render empty convert navbar when no integrations', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={HTML5Backend}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            )

            expect(queryByText('forum')).not.toBeInTheDocument()
            expect(queryByText('Performance')).not.toBeInTheDocument()
            expect(queryByText('Campaigns')).not.toBeInTheDocument()
            expect(queryByText('Click tracking')).not.toBeInTheDocument()
            expect(queryByText('Installation')).not.toBeInTheDocument()
        })

        it('should render convert navbar with integrations', () => {
            const {getAllByText, getByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: integrations,
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <QueryClientProvider client={queryClient}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </QueryClientProvider>
                    </DndProvider>
                </Provider>
            )

            expect(getAllByText('forum').length).toBe(2)

            expect(getAllByText('Performance').length).toBe(1)
            expect(getAllByText('Campaigns').length).toBe(1)
            expect(getAllByText('Click tracking').length).toBe(1)
            expect(getAllByText('Installation').length).toBe(1)
            expect(getAllByText('Set up').length).toBe(1)

            expect(getByText('convertgorgiastestchat')).toBeInTheDocument()

            // We expect 2 paywall icons per each integration
            expect(getAllByText('arrow_circle_up').length).toBe(2)
        })

        it('should render settings when ff is enabled', () => {
            mockUseContactFormFlag.mockReturnValue(true)
            const {getAllByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <QueryClientProvider client={queryClient}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </QueryClientProvider>
                    </DndProvider>
                </Provider>
            )
            expect(getAllByText('Settings').length).toBe(1)
        })

        it('should render convert navbar with integrations without paywalls', () => {
            isConvertSubscriberMock.mockReturnValue(true)

            const {getAllByText, getByText, queryByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: integrations,
                    })}
                >
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={HTML5Backend}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            )

            expect(getAllByText('forum').length).toBe(2)

            expect(getAllByText('Performance').length).toBe(1)
            expect(getAllByText('Campaigns').length).toBe(1)
            expect(getAllByText('Click tracking').length).toBe(1)
            expect(getAllByText('Installation').length).toBe(1)
            expect(getAllByText('Set up').length).toBe(1)

            expect(getByText('convertgorgiastestchat')).toBeInTheDocument()

            expect(queryByText('arrow_circle_up')).not.toBeInTheDocument()
        })

        it('should render convert navbar without Performance page for non-Shopify Chat', () => {
            isConvertSubscriberMock.mockReturnValue(true)

            const nonShopifyIntegrations = (
                fromJS(integrationsState) as Map<any, any>
            ).mergeIn(
                ['integrations'],
                [
                    {
                        ...integration,
                        meta: {
                            app_id: '101',
                            shop_type: IntegrationType.BigCommerce,
                        },
                    },
                ]
            )

            const {getAllByText, queryAllByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: nonShopifyIntegrations,
                    })}
                >
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={HTML5Backend}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            )

            expect(queryAllByText('Set up').length).toBe(1)
            expect(queryAllByText('Performance').length).toBe(0)

            expect(getAllByText('forum').length).toBe(2)
            expect(getAllByText('Campaigns').length).toBe(1)
            expect(getAllByText('Click tracking').length).toBe(1)
            expect(getAllByText('Installation').length).toBe(1)
        })

        it('should render skeleton on loading', () => {
            useGetOnboardingStatusMapSpy.mockReturnValue({
                onboardingMap: {},
                isLoading: true,
                isError: false,
            })

            const {queryByText, queryAllByTestId} = render(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={HTML5Backend}>
                            <ThemeProvider>
                                <ConvertNavbar />
                            </ThemeProvider>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            )

            expect(queryByText('forum')).not.toBeInTheDocument()
            expect(queryAllByTestId(MOCK_SKELETON_TEST_ID).length).toBe(2)
        })
    })
})
