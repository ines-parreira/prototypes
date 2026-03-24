import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import * as segment from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import axios from 'axios'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Route, Router, Switch } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { useStoresKnowledgeStatus } from 'pages/aiAgent/hooks/useStoresKnowledgeStatus'
import {
    payingWithCreditCard,
    storeWithActiveSubscriptionWithAutomation,
} from 'pages/settings/new_billing/fixtures'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { SalesEarlyAccessUtils } from '../../utils'
import { useActivation } from '../useActivation'
import { getStoreConfigurationFixture } from './fixtures/store-configurations.fixture'

// Mock only external services
jest.mock('@repo/feature-flags')
jest.mock('@repo/logging')
const mockLogEvent = jest.mocked(segment.logEvent)
jest.mock('models/helpCenter/queries')
const useGetHelpCenterListMock = assumeMock(useGetHelpCenterList)

jest.mock('pages/aiAgent/hooks/useStoresKnowledgeStatus')
const useStoresKnowledgeStatusMock = assumeMock(useStoresKnowledgeStatus)

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const mockAtLeastOneStoreHasActiveTrialOnSpecificStores = jest.mocked(
    atLeastOneStoreHasActiveTrialOnSpecificStores,
)

jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    getCurrentPlansByProduct: jest.fn(() => ({
        helpdesk: {
            plan_id: 'helpdesk_plan_id',
        },
        automation: {
            plan_id: 'automation_plan_id',
        },
    })),
}))

// Mock the entire module
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => {
    const originalModule = jest.requireActual(
        'pages/aiAgent/Activation/hooks/useStoreActivations',
    )

    // Create a mock implementation of migrateToNewPricing
    const migrateToNewPricingMock = jest.fn()

    return {
        ...originalModule,
        useStoreActivations: () => ({
            ...originalModule.useStoreActivations(),
            migrateToNewPricing: migrateToNewPricingMock,
        }),
        // Expose the mock so we can access it in tests
        migrateToNewPricingMock,
    }
})

const storeConfigurations: Record<string, StoreConfiguration> = {
    store1: getStoreConfigurationFixture({
        storeName: 'store1',
    }),
    store2: getStoreConfigurationFixture({
        storeName: 'store2',
    }),
}

const defaultState = {
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
    currentUser: fromJS({
        role: {
            name: 'admin',
        },
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                deleted_datetime: null,
                mappings: [],
                meta: {
                    shop_id: 54899465,
                    shop_domain: 'store1.com',
                    currency: 'USD',
                    shop_display_name: 'Store 1',
                    shop_name: 'store1',
                },
                deactivated_datetime: null,
                name: 'store1',
                uri: '/api/integrations/1/',
                type: 'shopify',
                created_datetime: '2020-01-28T22:19:15.604153+00:00',
                updated_datetime: '2020-01-28T22:19:15.604157+00:00',
            },
            {
                id: 2,
                deleted_datetime: null,
                mappings: [],
                meta: {
                    shop_id: 54899466,
                    shop_domain: 'store2.com',
                    currency: 'USD',
                    shop_display_name: 'Store 2',
                    shop_name: 'store2',
                },
                deactivated_datetime: null,
                name: 'store2',
                uri: '/api/integrations/2/',
                type: 'shopify',
                created_datetime: '2020-01-28T22:19:15.604153+00:00',
                updated_datetime: '2020-01-28T22:19:15.604157+00:00',
            },
        ],
    }),
    automate: fromJS({
        storeIntegrations: {
            store1: {
                id: 1,
                name: 'store1',
                type: 'shopify',
            },
            store2: {
                id: 2,
                name: 'store2',
                type: 'shopify',
            },
        },
    }),
}

const mockStore = configureMockStore([thunk])
const queryClient = mockQueryClient()

const mockSubscriptionUpdateApi = jest.fn(() =>
    Promise.resolve({
        data: {
            success: true,
            products:
                storeWithActiveSubscriptionWithAutomation.currentAccount
                    .current_subscription.products,
        },
    }),
)

const mockStoreConfigurationUpdateApi = jest.fn((data) =>
    Promise.resolve({ data: { storeConfiguration: data } }),
)
jest.spyOn(axios, 'put').mockImplementation((url, data) => {
    try {
        if (url === '/api/billing/subscription/') {
            return mockSubscriptionUpdateApi()
        } else if (
            url.match(
                /^\/config\/accounts\/[^\/]+\/stores\/[^\/]+\/configuration$/,
            )
        ) {
            return mockStoreConfigurationUpdateApi(data)
        }

        return Promise.reject(new Error('Non-mocked API call'))
    } catch (error) {
        return Promise.reject(error)
    }
})

const mockBillingStateApi = jest.fn(() =>
    Promise.resolve({ data: payingWithCreditCard }),
)
jest.spyOn(axios, 'get').mockImplementation(async (url) => {
    if (url === '/billing/state') {
        const val = await mockBillingStateApi()
        return val
    } else if (
        url.match(/^\/config\/accounts\/[^\/]+\/stores\/[^\/]+\/configuration/)
    ) {
        const storeName = url.match(
            /^\/config\/accounts\/[^\/]+\/stores\/([^\/]+)\/configuration/,
        )?.[1]
        return Promise.resolve({
            data: {
                storeConfiguration: storeConfigurations[storeName!],
            },
        })
    }

    return Promise.reject(new Error('Non-mocked API call'))
})

const renderHookWithRouter = ({
    initialEntry = '/',
    autoDisplayEarlyAccessDisabled = false,
    store = defaultState,
}: {
    initialEntry?: string
    autoDisplayEarlyAccessDisabled?: boolean
    store?: Record<string, any>
} = {}) => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <Router history={history}>
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(store)}>
                    <Switch>
                        <Route path="/overview">{children}</Route>
                        <Route path="/:shopName?">{children}</Route>
                    </Switch>
                </Provider>
            </QueryClientProvider>
        </Router>
    )

    return {
        ...renderHook(
            () =>
                useActivation({
                    autoDisplayEarlyAccessDisabled,
                }),
            { wrapper },
        ),
        history,
    }
}

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

describe('useActivation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.getItem = jest.fn()
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiAgentActivation) {
                return true
            }
            return false
        })
        useGetHelpCenterListMock.mockReturnValue({ data: undefined } as any)
        useStoresKnowledgeStatusMock.mockReturnValue({ data: undefined } as any)
    })

    describe('activationModal', () => {
        // more context in [AIFLY-955]
        it.skip('should show early access modal when clicking on learn more', async () => {
            const { result } = renderHookWithRouter()

            await act(() => {
                result.current.activationModal.props.onLearnMoreClick()
            })

            expect(result.current.earlyAccessModal.props.isOpen).toBe(true)
        })

        describe('when AiAgentNewActivationXp Off', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.AiAgentNewActivationXp) {
                        return false
                    }
                    return false
                })
            })

            it('should render legacy modal', () => {
                const { result } = renderHookWithRouter()
                expect(result.current.activationModal.type).toBe(
                    AiAgentActivationModal,
                )
            })

            // more context in [AIFLY-955]
            it.skip('should handle sales change and show early access modal when not on new plan', async () => {
                const { result } = renderHookWithRouter()

                await act(() => {
                    result.current.activationModal.props.onSalesChange(
                        'store1',
                        true,
                    )
                })

                expect(result.current.earlyAccessModal.props.isOpen).toBe(true)
            })

            it('should handle support changes', async () => {
                const { result } = renderHookWithRouter()

                await act(() => {
                    result.current.activationModal.props.onSupportChange(
                        'store1',
                        true,
                    )
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    segment.SegmentEvent.AiAgentActivateModalSkillEnabled,
                    {
                        storeName: 'store1',
                        skill: 'support',
                        page: '/',
                    },
                )
            })
        })

        describe('when AiAgentNewActivationXp On', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.AiAgentNewActivationXp) {
                        return true
                    }
                    return false
                })
            })

            it('should render new modal', () => {
                const { result } = renderHookWithRouter()
                expect(result.current.activationModal.type).toBe(
                    AiAgentActivationModal,
                )
            })
        })

        it('should handle support chat changes', async () => {
            const { result } = renderHookWithRouter()

            await act(() => {
                result.current.activationModal.props.onSupportChatChange(
                    'store1',
                    true,
                )
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.AiAgentActivateModalSkillEnabled,
                {
                    storeName: 'store1',
                    skill: 'support',
                    page: '/',
                    channel: 'chat',
                },
            )
        })

        it('should handle support email changes', async () => {
            const { result } = renderHookWithRouter()

            await act(() => {
                result.current.activationModal.props.onSupportEmailChange(
                    'store1',
                    true,
                )
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.AiAgentActivateModalSkillEnabled,
                {
                    storeName: 'store1',
                    skill: 'support',
                    page: '/',
                    channel: 'email',
                },
            )
        })

        it('should open the activation modal when ?focusActivationModal param is present', () => {
            const { result } = renderHookWithRouter({
                initialEntry: '/?focusActivationModal=true',
            })

            expect(result.current.activationModal.props.isOpen).toBe(true)
        })
    })

    describe('earlyAccessModal', () => {
        beforeEach(() => {
            mockAtLeastOneStoreHasActiveTrialOnSpecificStores.mockReturnValue(
                false,
            )
        })

        afterEach(() => {
            window.localStorage.removeItem(
                SalesEarlyAccessUtils(account.id).modalDisplayedAtKey,
            )
        })

        it('should handle modal close', async () => {
            const { result } = renderHookWithRouter()

            await act(() => {
                result.current.earlyAccessModal.props.onClose()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
                {
                    page: '/',
                    reason: 'clicked-on-cross-or-outside',
                },
            )
        })

        it('should handle successful upgrade', async () => {
            const { result } = renderHookWithRouter()

            await act(async () => {
                await result.current.earlyAccessModal.props.onUpgradeClick()
            })

            // expect(mockLogEvent).toHaveBeenCalledWith(
            //     segment.SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
            //     {
            //         page: '/',
            //         reason: 'upgraded',
            //     },
            // )
        })

        it('should call migrateToNewPricing when hasAiAgentNewActivationXp=true after pricing upgrade', async () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiAgentNewActivationXp) {
                    return true
                }
                return false
            })

            const { result } = renderHookWithRouter()

            await act(async () => {
                await result.current.earlyAccessModal.props.onUpgradeClick()
            })

            const {
                migrateToNewPricingMock,
            } = require('pages/aiAgent/Activation/hooks/useStoreActivations')
            await waitFor(() => {
                expect(migrateToNewPricingMock).toHaveBeenCalled()
            })
        })

        it('should not call migrateToNewPricing when hasAiAgentNewActivationXp=false after pricing upgrade', async () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiAgentNewActivationXp) {
                    return false
                }
                return false
            })

            const { result } = renderHookWithRouter()

            await act(async () => {
                await result.current.earlyAccessModal.props.onUpgradeClick()
            })

            const {
                migrateToNewPricingMock,
            } = require('pages/aiAgent/Activation/hooks/useStoreActivations')
            await waitFor(() => {
                expect(migrateToNewPricingMock).not.toHaveBeenCalled()
            })
        })

        it('should log event when modal is viewed', async () => {
            const { result } = renderHookWithRouter()

            await act(() => {
                result.current.activationModal.props.onSalesChange(
                    'store1',
                    true,
                )
            })

            // expect(mockLogEvent).toHaveBeenCalledWith(
            //     segment.SegmentEvent.AiAgentActivateEarlyAccessModalViewed,
            //     { page: '/' },
            // )
        })

        it('should not auto-display early access modal when account is in trial', async () => {
            const { result } = renderHookWithRouter({
                initialEntry: '/',
            })

            expect(result.current.earlyAccessModal.props.isOpen).toBe(false)
        })

        it('should not auto-display early access modal when one store is in active trial', async () => {
            mockAtLeastOneStoreHasActiveTrialOnSpecificStores.mockReturnValue(
                true,
            )

            const { result } = renderHookWithRouter({
                initialEntry: '/',
                store: {
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            status: 'active',
                        },
                    }),
                },
            })

            expect(result.current.earlyAccessModal.props.isOpen).toBe(false)
        })

        // more context in [AIFLY-955]
        it.skip('should auto-display early access modal when account is not on new automate plan', async () => {
            const store = {
                ...defaultState,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        status: 'active',
                    },
                }),
            }

            const { result } = renderHookWithRouter({
                initialEntry: '/',
                store,
            })

            expect(result.current.earlyAccessModal.props.isOpen).toBe(true)
        })

        it('should open upgrade modal on sales enabled and then save configurations when upgrade is successful', async () => {
            const { result } = renderHookWithRouter({
                autoDisplayEarlyAccessDisabled: true,
            })

            await act(() => {
                result.current.activationModal.props.onSalesChange(
                    'store1',
                    true,
                )
            })

            // expect(result.current.earlyAccessModal.props.isOpen).toBe(true)

            await act(async () => {
                await result.current.earlyAccessModal.props.onUpgradeClick()
            })

            // await waitFor(() => {
            //     expect(mockStoreConfigurationUpdateApi).toHaveBeenCalledWith(
            //         'store1',
            //         { sales: true, support: false },
            //     )
            // })
        })
    })
})
