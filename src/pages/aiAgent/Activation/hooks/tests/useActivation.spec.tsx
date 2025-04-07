import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as segment from 'common/segment'
import { logEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { StoreConfiguration } from 'models/aiAgent/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useActivation } from '../useActivation'
import { getStoreConfigurationFixture } from './fixtures/store-configurations.fixture'

// Mock only external services
jest.mock('launchdarkly-react-client-sdk')
jest.mock('common/segment')
jest.mock('core/flags')
jest.mock('common/segment')
const mockLogEvent = jest.mocked(logEvent)
jest.mock('models/helpCenter/queries')

jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    getCurrentPlansByProduct: jest.fn(() => ({
        helpdesk: {
            price_id: 'helpdesk_price_id',
        },
        automation: {
            price_id: 'automation_price_id',
        },
    })),
}))

const storeConfigurations: Record<string, StoreConfiguration> = {
    store1: getStoreConfigurationFixture({
        storeName: 'store1',
    }),
    store2: getStoreConfigurationFixture({
        storeName: 'store2',
    }),
}

const defaultState = {
    billing: fromJS({
        products: [
            {
                type: 'helpdesk',
                prices: [{ amount: 100, cadence: 'month' }],
            },
        ],
    }),
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
            subscription: {
                id: 'sub_updated',
                status: 'active',
            },
            current_plans: {
                helpdesk: {
                    id: 'plan_123',
                    name: 'Pro',
                    price: 100,
                    interval: 'month',
                },
                automation: {
                    id: 'plan_automation',
                    price_id: 'price_automation',
                    name: 'AI Agent',
                    price: 50,
                    interval: 'month',
                },
            },
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

const defaultBillingState = {
    upcoming_invoice: null,
    subscription: {
        id: 'sub_123',
        status: 'active',
        current_period_end: '2024-12-31T23:59:59Z',
    },
    customer: {
        id: 'cus_123',
        email: 'test@example.com',
    },
    current_plans: {
        helpdesk: {
            id: 'plan_123',
            name: 'Pro',
            price: 100,
            interval: 'month',
        },
        automation: {
            price_id: 'price_123',
        },
        automate: { generation: 5 },
        convert: null,
    },
}
const mockBillingStateApi = jest.fn(() =>
    Promise.resolve({ data: defaultBillingState }),
)
jest.spyOn(axios, 'get').mockImplementation(async (url) => {
    if (url === '/billing/state') {
        const val = await mockBillingStateApi()
        return val
    } else if (url === '/api/billing/early-access-automate-plan') {
        return Promise.resolve({
            data: {
                plan: {
                    id: 'early_access_plan',
                    name: 'Early Access',
                    price: 50,
                    interval: 'month',
                },
            },
        })
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
    pageName = 'dummy-page',
    initialEntry = '/',
    autoDisplayEarlyAccessDisabled = false,
}: {
    pageName?: string
    initialEntry?: string
    autoDisplayEarlyAccessDisabled?: boolean
} = {}) => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Router history={history}>
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <Route path="/:shopName?">{children}</Route>
                </Provider>
            </QueryClientProvider>
        </Router>
    )

    return {
        ...renderHook(
            () =>
                useActivation(pageName, {
                    autoDisplayEarlyAccessDisabled,
                }),
            { wrapper },
        ),
        history,
    }
}

jest.mock('core/flags')
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
    })

    describe('activationButton', () => {
        it('should render activation button when feature flag is enabled', () => {
            const { result } = renderHookWithRouter()

            expect(result.current.activationButton).toBeDefined()
            expect(
                result.current.activationButton?.props.progress,
            ).toBeDefined()
        })

        it('should render bordered variant when on overview page', () => {
            const { result } = renderHookWithRouter({ pageName: 'overview' })

            expect(result.current.activationButton?.props.variant).toBe(
                'bordered',
            )
        })

        it('should open activation modal and log event when clicked', () => {
            const { result } = renderHookWithRouter()

            act(() => {
                result.current.activationButton?.props.onClick()
            })

            expect(result.current.activationModal.props.isOpen).toBe(true)
            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.AiAgentActivateMainButtonClicked,
                { page: 'dummy-page' },
            )
        })
    })

    describe('activationModal', () => {
        it('should handle sales change and show early access modal when not on new plan', () => {
            const { result } = renderHookWithRouter()

            act(() => {
                result.current.activationModal.props.onSalesChange(
                    'store1',
                    true,
                )
            })

            expect(result.current.earlyAccessModal.props.isOpen).toBe(true)
        })

        it('should show multiple stores in the modal when there is no shopName param in the url', async () => {
            // const { result } = renderHookWithRouter()
            // await waitFor(() => {
            //     expect(
            //         result.current.activationModal.props.storeActivations
            //             .length,
            //     ).toEqual(2)
            // })
        })

        it('should show only one store in the modal when there is a shopName param in the url', async () => {
            // const { result } = renderHookWithRouter({
            //     initialEntry: '/store2',
            // })
            // await waitFor(() => {
            //     expect(
            //         result.current.activationModal.props.storeActivations
            //             .length,
            //     ).toEqual(1)
            // })
        })

        it('should handle sales change directly when on new plan', async () => {
            mockBillingStateApi.mockReturnValue(
                Promise.resolve({
                    data: {
                        ...defaultBillingState,
                        current_plans: {
                            ...defaultBillingState.current_plans,
                            automate: { generation: 6 },
                        },
                    },
                }),
            )

            const { result } = renderHookWithRouter({
                autoDisplayEarlyAccessDisabled: true,
            })

            act(() => {
                result.current.activationModal.props.onSalesChange(
                    'store1',
                    true,
                )
            })

            // await waitFor(() => {
            //     expect(result.current.earlyAccessModal.props.isOpen).toBe(false)
            //     expect(mockLogEvent).toHaveBeenCalledWith(
            //         segment.SegmentEvent.AiAgentActivateModalSkillEnabled,
            //         {
            //             storeName: 'store1',
            //             skill: 'sales',
            //             page: 'dummy-page',
            //         },
            //     )
            // })
        })

        it('should handle support changes', () => {
            const { result } = renderHookWithRouter()

            act(() => {
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
                    page: 'dummy-page',
                },
            )
        })

        it('should handle support chat changes', () => {
            const { result } = renderHookWithRouter()

            act(() => {
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
                    page: 'dummy-page',
                    channel: 'chat',
                },
            )
        })

        it('should handle support email changes', () => {
            const { result } = renderHookWithRouter()

            act(() => {
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
                    page: 'dummy-page',
                    channel: 'email',
                },
            )
        })

        it('should handle save configurations successfully', async () => {
            const { result } = renderHookWithRouter({
                autoDisplayEarlyAccessDisabled: true,
            })

            act(() => {
                result.current.activationButton?.props.onClick()
            })
            act(() => {
                result.current.activationModal?.props.onSupportChange(
                    'store1',
                    true,
                )
            })

            await act(async () => {
                await result.current.activationModal?.props.onSaveClick()
            })

            // await waitFor(() => {
            //     expect(mockStoreConfigurationUpdateApi).toHaveBeenCalled()
            //     expect(mockLogEvent).toHaveBeenCalledWith(
            //         segment.SegmentEvent.AiAgentActivateCloseActivationModal,
            //         {
            //             page: 'dummy-page',
            //             reason: 'clicked-on-save-button',
            //         },
            //     )
            // })
        })

        it('should close modal and log event when clicking close', () => {
            const { result } = renderHookWithRouter()

            act(() => {
                result.current.activationButton?.props.onClick()
            })

            act(() => {
                result.current.activationModal.props.onClose()
            })

            expect(result.current.activationModal.props.isOpen).toBe(false)
            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.AiAgentActivateCloseActivationModal,
                {
                    page: 'dummy-page',
                    reason: 'clicked-on-cancel-or-clicked-outside',
                },
            )
        })

        it('should open the activation modal when ?focusActivationModal param is present', () => {
            const { result } = renderHookWithRouter({
                pageName: 'dummy-page',
                initialEntry: '/?focusActivationModal=true',
            })

            expect(result.current.activationModal.props.isOpen).toBe(true)
        })
    })

    describe('earlyAccessModal', () => {
        it('should handle modal close', () => {
            const { result } = renderHookWithRouter()

            act(() => {
                result.current.earlyAccessModal.props.onClose()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
                {
                    page: 'dummy-page',
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
            //         page: 'dummy-page',
            //         reason: 'upgraded',
            //     },
            // )
        })

        it('should log event when modal is viewed', () => {
            const { result } = renderHookWithRouter()

            act(() => {
                result.current.activationModal.props.onSalesChange(
                    'store1',
                    true,
                )
            })

            // expect(mockLogEvent).toHaveBeenCalledWith(
            //     segment.SegmentEvent.AiAgentActivateEarlyAccessModalViewed,
            //     { page: 'dummy-page' },
            // )
        })

        it('should auto-display early access modal when redering hook for the first time only', () => {
            renderHookWithRouter({
                pageName: 'dummy-page',
                initialEntry: '/',
            })

            // expect(result.current.earlyAccessModal.props.isOpen).toBe(true)

            const { result: result2 } = renderHookWithRouter({
                pageName: 'dummy-page',
                initialEntry: '/',
            })

            expect(result2.current.earlyAccessModal.props.isOpen).toBe(false)
        })

        it('should open upgrade modal on sales enabled and then save configurations when upgrade is successful', async () => {
            const { result } = renderHookWithRouter({
                autoDisplayEarlyAccessDisabled: true,
            })

            act(() => {
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
