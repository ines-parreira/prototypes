import { DATE_FORMAT } from '@repo/billing'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { convertStatusOk } from 'fixtures/convert'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan0,
    convertPlan1,
    firstTierMonthlyAutomationPlan,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    proMonthlyHelpdeskPlan,
    SMS_PRODUCT_ID,
    smsPlan0,
    smsPlan1,
    VOICE_PRODUCT_ID,
    voicePlan0,
} from 'fixtures/plans'
import client from 'models/api/resources'
import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    Plan,
} from 'models/billing/types'
import { Cadence, ProductType, SubscriptionStatus } from 'models/billing/types'
import { getCadenceName, getProductInfo } from 'models/billing/utils'
import { useConvertApi } from 'pages/convert/common/hooks/useConvertApi'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import type { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'
import type { Components } from 'rest_api/revenue_addon_api/client.generated'
import { notify } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import type { RootState, StoreDispatch, StoreState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useBillingPlans } from '../useBillingPlan'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('models/api/resources', () => ({
    get: jest.fn(),
    put: jest.fn(() => {
        return {
            data: {
                products: [],
            },
        }
    }),
}))
const mockClientGet = assumeMock(client.get)
const mockClientPut = assumeMock(client.put)

const mockStartSubscription = jest.fn()
jest.mock('services/gorgiasApi', () => {
    return jest.fn().mockImplementation(() => {
        return {
            startSubscription: mockStartSubscription,
        }
    })
})

jest.mock('pages/convert/common/hooks/useGetConvertStatus', () => ({
    __esModule: true,
    ...jest.requireActual('pages/convert/common/hooks/useGetConvertStatus'),
    default: jest.fn(),
}))
const mockUseGetConvertStatus = useGetConvertStatus as jest.MockedFunction<
    typeof useGetConvertStatus
>

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    ...jest.requireActual('pages/convert/common/hooks/useConvertApi'),
    useConvertApi: jest.fn(),
}))
const useConvertApiMock = assumeMock(useConvertApi)

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => (args: Record<string, unknown>) => args),
}))
const notifyMock = assumeMock(notify)

const store: DeepPartial<StoreState> = {
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
}

describe('useBillingPlans', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('updateSubscription', () => {
        const mockUpdateAutoUpgradeFlag = jest.fn()
        beforeEach(() => {
            useConvertApiMock.mockImplementation(() => ({
                isReady: true,
                client: {
                    update_auto_upgrade_flag: mockUpdateAutoUpgradeFlag,
                } as unknown as RevenueAddonClient,
            }))
        })

        type UpdateSubscriptionOption = [
            'upgrading' | 'downgrading' | 'registering',
            ProductType,
            string,
            Plan | undefined,
            Plan | undefined,
        ]

        const updateSubscriptionOptions: UpdateSubscriptionOption[] = [
            [
                'upgrading',
                ProductType.Helpdesk,
                HELPDESK_PRODUCT_ID,
                basicMonthlyHelpdeskPlan,
                proMonthlyHelpdeskPlan,
            ],
            [
                'downgrading',
                ProductType.Helpdesk,
                HELPDESK_PRODUCT_ID,
                proMonthlyHelpdeskPlan,
                basicMonthlyHelpdeskPlan,
            ],
            [
                'registering',
                ProductType.Automation,
                AUTOMATION_PRODUCT_ID,
                undefined,
                basicMonthlyAutomationPlan,
            ],
            [
                'upgrading',
                ProductType.Automation,
                AUTOMATION_PRODUCT_ID,
                basicMonthlyAutomationPlan,
                firstTierMonthlyAutomationPlan,
            ],
            [
                'downgrading',
                ProductType.Automation,
                AUTOMATION_PRODUCT_ID,
                firstTierMonthlyAutomationPlan,
                basicMonthlyAutomationPlan,
            ],
            [
                'registering',
                ProductType.Convert,
                CONVERT_PRODUCT_ID,
                undefined,
                convertPlan0,
            ],
            [
                'upgrading',
                ProductType.Convert,
                CONVERT_PRODUCT_ID,
                convertPlan0,
                convertPlan1,
            ],
            [
                'downgrading',
                ProductType.Convert,
                CONVERT_PRODUCT_ID,
                convertPlan1,
                convertPlan0,
            ],
        ]

        it('should handle an undefined selection', async () => {
            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()

            const alteredStore = mockedStore({
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            })

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={alteredStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.Helpdesk]: {
                        plan: undefined,
                        isSelected: true,
                    },
                })),
            )

            await act(async () => result.current.updateSubscription())

            // N.B. because the plan is undefined we don't do anything
            expect(notifyMock).toHaveBeenCalledTimes(0)
        })

        it.each(Object.values(Cadence))(
            'should notify users when billing frequency changes to %s',
            async (cadence: Cadence) => {
                const dispatchBillingError = jest.fn()
                const queryClient = mockQueryClient()

                const oldPlan = helpdeskProduct.prices.find(
                    (plan: HelpdeskPlan) => plan.cadence !== cadence,
                )
                const newPlan = helpdeskProduct.prices.find(
                    (plan: HelpdeskPlan) => plan.cadence === cadence,
                )

                if (oldPlan === undefined || newPlan === undefined) {
                    expect(oldPlan).toBeDefined()
                    expect(newPlan).toBeDefined()
                    return
                }

                const alteredStore = mockedStore({
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [HELPDESK_PRODUCT_ID]: oldPlan.plan_id,
                            },
                        },
                    }),
                })

                const { result } = renderHook(
                    () =>
                        useBillingPlans({
                            dispatchBillingError,
                        }),
                    {
                        wrapper: ({ children }) => (
                            <QueryClientProvider client={queryClient}>
                                <Provider store={alteredStore}>
                                    {children}
                                </Provider>
                            </QueryClientProvider>
                        ),
                    },
                )

                await act(async () =>
                    result.current.setSelectedPlans((prev) => ({
                        ...prev,
                        [ProductType.Helpdesk]: {
                            plan: newPlan,
                            isSelected: true,
                        },
                    })),
                )

                await act(async () => result.current.updateSubscription())

                expect(notifyMock).toHaveBeenCalledWith({
                    message: `Your billing frequency has been updated to ${getCadenceName(cadence)}`,
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    dismissAfter: 5000,
                })
            },
        )

        it('should notify users when they remove AI Agent', async () => {
            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()

            const alteredStore = mockedStore({
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [AUTOMATION_PRODUCT_ID]:
                                firstTierMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            })

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={alteredStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.Automation]: {
                        plan: basicYearlyHelpdeskPlan,
                        isSelected: false,
                    },
                })),
            )

            await act(async () => result.current.updateSubscription())

            expect(notifyMock).toHaveBeenCalledWith({
                message: 'You have removed AI Agent from your subscription',
                status: NotificationStatus.Success,
                style: NotificationStyle.Alert,
            })
        })

        it('should not notify users when they remove AI Agent if not on free trial', async () => {
            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()

            const alteredStore = mockedStore({
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        status: SubscriptionStatus.ACTIVE,
                        products: {
                            ...account.current_subscription.products,
                            [AUTOMATION_PRODUCT_ID]:
                                firstTierMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            })

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={alteredStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.Automation]: {
                        plan: basicYearlyHelpdeskPlan,
                        isSelected: false,
                    },
                })),
            )

            await act(async () => result.current.updateSubscription())

            expect(notifyMock).not.toHaveBeenCalledWith({
                message: 'You have removed AI Agent from your subscription',
                status: NotificationStatus.Success,
                style: NotificationStyle.Alert,
            })
        })

        it.each([
            ['enable', false, true],
            ['disable', true, false],
            ['no change (enabled)', true, true],
            ['no change (disabled)', false, false],
        ])(
            'should handle auto-upgrade for convert: %s',
            async (
                name: string,
                startEnabled: boolean,
                endEnabled: boolean,
            ) => {
                const dispatchBillingError = jest.fn()
                const queryClient = mockQueryClient()

                const alteredStore = mockedStore({
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [CONVERT_PRODUCT_ID]: convertPlan0.plan_id,
                            },
                        },
                    }),
                })

                const { result } = renderHook(
                    () =>
                        useBillingPlans({
                            dispatchBillingError,
                        }),
                    {
                        wrapper: ({ children }) => (
                            <QueryClientProvider client={queryClient}>
                                <Provider store={alteredStore}>
                                    {children}
                                </Provider>
                            </QueryClientProvider>
                        ),
                    },
                )

                mockUseGetConvertStatus.mockImplementationOnce(
                    () =>
                        ({
                            ...convertStatusOk,
                            auto_upgrade_enabled: startEnabled,
                        }) as Components.Schemas.SubscriptionUsageAndBundleStatusSchema,
                )

                await act(async () =>
                    result.current.setSelectedPlans((prev) => ({
                        ...prev,
                        [ProductType.Convert]: {
                            plan: convertPlan0,
                            isSelected: false,
                            autoUpgrade: endEnabled,
                        },
                    })),
                )

                await act(async () => result.current.updateSubscription())

                if (startEnabled !== endEnabled) {
                    expect(mockUpdateAutoUpgradeFlag).toHaveBeenCalledTimes(1)
                    expect(mockUpdateAutoUpgradeFlag).toHaveBeenCalledWith(
                        {},
                        { enabled: endEnabled },
                    )
                }
            },
        )

        it.each(updateSubscriptionOptions)(
            'should notify non-trial users when %s %s plan',
            async (
                __name: string,
                productType: ProductType,
                productID: string,
                oldPlan: Plan | undefined,
                newPlan: Plan | undefined,
            ) => {
                if (
                    productType === ProductType.SMS ||
                    productType === ProductType.Voice
                ) {
                    // Currently no valid path in code - this branch reduces code complexity by removing product types
                    // assert so if this path ever becomes viable, we are notified that it's not tested
                    expect(false).toBeTruthy()
                    return
                }

                const dispatchBillingError = jest.fn()
                const queryClient = mockQueryClient()

                const alteredStore = mockedStore({
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            status: 'active',
                            products: {
                                ...account.current_subscription.products,
                                [productID]: oldPlan?.plan_id,
                            },
                        },
                    }),
                })

                const { result } = renderHook(
                    () =>
                        useBillingPlans({
                            dispatchBillingError,
                        }),
                    {
                        wrapper: ({ children }) => (
                            <QueryClientProvider client={queryClient}>
                                <Provider store={alteredStore}>
                                    {children}
                                </Provider>
                            </QueryClientProvider>
                        ),
                    },
                )

                await act(async () =>
                    result.current.setSelectedPlans((prev) => ({
                        ...prev,
                        [productType]: {
                            plan: newPlan,
                            isSelected: true,
                        },
                    })),
                )

                await act(async () => result.current.updateSubscription())

                if (!oldPlan) {
                    const message = {
                        [ProductType.Helpdesk]: '', // Should be impossible to not have helpdesk
                        [ProductType.Automation]:
                            'Woohoo! You now have access to <strong>AI Agent!</strong>',
                        [ProductType.Convert]:
                            'Woohoo! You now have access to <strong>Convert!</strong>',
                    }[productType]

                    const buttonLabel = {
                        [ProductType.Helpdesk]: '', // Should be impossible to not have helpdesk
                        [ProductType.Automation]: 'Set Up AI Agent',
                        [ProductType.Convert]: 'Set Up Convert',
                    }[productType]

                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Success,
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                        noAutoDismiss: true,
                        allowHTML: true,
                        message: message,
                        buttons: [
                            expect.objectContaining({
                                name: buttonLabel,
                                primary: false,
                                // N.B. can't compare onClick
                            }),
                        ],
                    })
                } else if (!newPlan) {
                    // Currently no valid path in code - this branch reduces code complexity by removing newPlan==undefined
                    // assert so if this path ever becomes viable, we are notified that it's not tested
                    expect(false).toBeTruthy()
                } else if (oldPlan.amount > newPlan.amount) {
                    const periodEnd = moment(
                        billingState.currentProductsUsage.helpdesk?.meta
                            .subscription_end_datetime,
                    ).format(DATE_FORMAT)

                    const message = {
                        [ProductType.Helpdesk]: `Your subscription will change to <strong>${newPlan.name}</strong> on <strong>${periodEnd}</strong>.`,
                        [ProductType.Automation]: `Your AI Agent subscription will change to <strong>${newPlan.num_quota_tickets} ${getProductInfo(ProductType.Automation, newPlan as AutomatePlan).counter}/${newPlan.cadence}</strong> on <strong>${periodEnd}</strong>.`,
                        [ProductType.Convert]: `Your Convert subscription will change to <strong>${newPlan.num_quota_tickets} ${getProductInfo(ProductType.Convert, newPlan as ConvertPlan).counter}/${newPlan.cadence}</strong> on <strong>${periodEnd}</strong>.`,
                    }[productType]

                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Success,
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                        noAutoDismiss: true,
                        allowHTML: true,
                        message: message,
                        buttons: [],
                    })
                } else {
                    const message = {
                        [ProductType.Helpdesk]: `Success! Helpdesk was upgraded to <strong>${newPlan.name}</strong>`,
                        [ProductType.Automation]: `Success! You now have <strong>${newPlan.num_quota_tickets} ${getProductInfo(ProductType.Automation, newPlan as AutomatePlan).counter} per ${newPlan.cadence}</strong>`,
                        [ProductType.Convert]: `Success! You now have <strong>${newPlan.num_quota_tickets} ${getProductInfo(ProductType.Convert, newPlan as ConvertPlan).counter} per ${newPlan.cadence}</strong>`,
                    }[productType]

                    const buttonLabel = {
                        [ProductType.Helpdesk]: 'Helpdesk Settings',
                        [ProductType.Automation]: 'AI Agent Settings',
                        [ProductType.Convert]: 'Convert Settings',
                    }[productType]

                    expect(notifyMock).toHaveBeenCalledWith({
                        status: NotificationStatus.Success,
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                        noAutoDismiss: true,
                        allowHTML: true,
                        message: message,
                        buttons: [
                            expect.objectContaining({
                                name: buttonLabel,
                                primary: false,
                                // N.B. can't compare onClick
                            }),
                        ],
                    })
                }
            },
        )

        it.each(updateSubscriptionOptions)(
            'should not notify trial users when %s %s plan',
            async (
                __name: string,
                productType: ProductType,
                productID: string,
                oldPlan: Plan | undefined,
                newPlan: Plan | undefined,
            ) => {
                if (
                    productType === ProductType.SMS ||
                    productType === ProductType.Voice
                ) {
                    // Currently no valid path in code - this branch reduces code complexity by removing product types
                    // assert so if this path ever becomes viable, we are notified that it's not tested
                    expect(false).toBeTruthy()
                    return
                }

                const dispatchBillingError = jest.fn()
                const queryClient = mockQueryClient()

                const alteredStore = mockedStore({
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [productID]: oldPlan?.plan_id,
                            },
                        },
                    }),
                })

                const { result } = renderHook(
                    () =>
                        useBillingPlans({
                            dispatchBillingError,
                        }),
                    {
                        wrapper: ({ children }) => (
                            <QueryClientProvider client={queryClient}>
                                <Provider store={alteredStore}>
                                    {children}
                                </Provider>
                            </QueryClientProvider>
                        ),
                    },
                )

                await act(async () =>
                    result.current.setSelectedPlans((prev) => ({
                        ...prev,
                        [productType]: {
                            plan: newPlan,
                            isSelected: true,
                        },
                    })),
                )

                await act(async () => result.current.updateSubscription())

                expect(notifyMock).toHaveBeenCalledTimes(0)
            },
        )

        it('should submit a support ticket when a non-vetted user selects a phone plan', async () => {
            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockedStore(store)}>
                                {children}
                            </Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.SMS]: {
                        plan: smsPlan1,
                        isSelected: true,
                    },
                })),
            )

            await act(async () => result.current.updateSubscription())

            expect(mockClientGet).toHaveBeenCalledTimes(1)
            // ticket created should contain "SMS plan request: SMS Addon 150 Monthly"
            expect(mockClientGet).toHaveBeenCalledWith(
                'https://hooks.zapier.com/hooks/catch/9639651/3hsj6pb/?message=New%20SMS%20Add-on%20Request%20by%20acme%0AProduct(s)%3A%20SMS%20Add-on%20Plan%20selection%20-%20acme%0ASMS%20plan%20request%3A%20SMS%20Addon%20150%20Monthly&from=undefined&to=billing%40gorgias.com&subject=SMS%20Add-on%20Plan%20selection%20-%20acme&helpdeskPlan=Basic&freeTrial=true&account=acme',
                {
                    transformRequest: expect.any(Function),
                },
            )
        })

        it('should update subscriptions when a vetted user changes phone plans', async () => {
            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()
            const alteredStore = mockedStore({
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [SMS_PRODUCT_ID]: smsPlan0.plan_id,
                            [VOICE_PRODUCT_ID]: voicePlan0.plan_id,
                        },
                    },
                }),
            })

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={alteredStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.SMS]: {
                        plan: smsPlan1,
                        isSelected: true,
                    },
                })),
            )

            await act(async () => result.current.updateSubscription())

            // ensure we're not trying to create a support ticket
            expect(mockClientGet).not.toHaveBeenCalled()

            expect(mockClientPut).toHaveBeenCalledTimes(1)
            expect(mockClientPut).toHaveBeenCalledWith(
                '/api/billing/subscription/',
                {
                    prices: [
                        basicMonthlyHelpdeskPlan.plan_id,
                        voicePlan0.plan_id, // current voice plan stays in place
                        smsPlan1.plan_id,
                    ],
                },
            )
        })

        it('should call dispatchBillingError when subscription update fails', async () => {
            const mockError = new Error('Billing update failed')

            mockClientPut.mockRejectedValue(mockError)

            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()

            const alteredStore = mockedStore({
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [SMS_PRODUCT_ID]: smsPlan0.plan_id,
                            [VOICE_PRODUCT_ID]: voicePlan0.plan_id,
                        },
                    },
                }),
            })

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={alteredStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.SMS]: {
                        plan: smsPlan1,
                        isSelected: true,
                    },
                })),
            )

            await act(() =>
                expect(result.current.updateSubscription()).rejects.toThrow(
                    'Billing update failed',
                ),
            )

            expect(mockClientPut).toHaveBeenCalledTimes(1)
            expect(dispatchBillingError).toHaveBeenCalledWith(mockError)
        })

        it('should call dispatchBillingError when support ticket creation fails', async () => {
            const dispatchBillingError = jest.fn()
            const queryClient = mockQueryClient()
            const mockError = new Error('Support ticket creation failed')
            mockClientGet.mockRejectedValueOnce(mockError)

            const { result } = renderHook(
                () =>
                    useBillingPlans({
                        dispatchBillingError,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockedStore(store)}>
                                {children}
                            </Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            await act(async () =>
                result.current.setSelectedPlans((prev) => ({
                    ...prev,
                    [ProductType.SMS]: {
                        plan: smsPlan1,
                        isSelected: true,
                    },
                })),
            )

            await act(() =>
                expect(result.current.updateSubscription()).rejects.toThrow(
                    'Support ticket creation failed',
                ),
            )

            expect(mockClientGet).toHaveBeenCalledTimes(1)
            expect(dispatchBillingError).toHaveBeenCalledWith(mockError)
        })
    })

    describe('startSubscription', () => {
        it.each(
            Object.values(SubscriptionStatus).filter(
                (value) => value !== SubscriptionStatus.TRIALING,
            ),
        )(
            'should do nothing if the subscription state is %s',
            async (subscriptionStatus: SubscriptionStatus) => {
                const dispatchBillingError = jest.fn()
                const queryClient = mockQueryClient()

                const alteredStore = mockedStore({
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            status: subscriptionStatus,
                            products: {
                                ...account.current_subscription.products,
                                [HELPDESK_PRODUCT_ID]:
                                    basicMonthlyHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                })

                const { result } = renderHook(
                    () =>
                        useBillingPlans({
                            dispatchBillingError,
                        }),
                    {
                        wrapper: ({ children }) => (
                            <QueryClientProvider client={queryClient}>
                                <Provider store={alteredStore}>
                                    {children}
                                </Provider>
                            </QueryClientProvider>
                        ),
                    },
                )

                await act(async () =>
                    result.current.setSelectedPlans((prev) => ({
                        ...prev,
                        [ProductType.Helpdesk]: {
                            plan: basicYearlyHelpdeskPlan,
                            isSelected: true,
                        },
                    })),
                )

                await act(async () => result.current.startSubscription())

                expect(mockClientGet).toHaveBeenCalledTimes(0)
            },
        )

        type StartSubscriptionOption = [
            string, // name
            string | null, // confirmation_url
            string | null, // error
            Notification,
        ]

        const startSubscriptionOptions: StartSubscriptionOption[] = [
            [
                'success',
                null,
                null,
                {
                    status: NotificationStatus.Success,
                    message: 'Your subscription has started!',
                },
            ],
            [
                'confirmation required',
                'confirmation.com/required',
                null,
                {
                    status: NotificationStatus.Info,
                    message:
                        'In order to activate your subscription, we need you to confirm this payment to your bank. ' +
                        'You will be redirected in a few seconds to a secure page.',
                    dismissAfter: 5000,
                    dismissible: false,
                },
            ],
            [
                'error',
                null,
                'there was an error',
                {
                    status: NotificationStatus.Error,
                    message: `there was an error Please update your payment method and retry to pay your invoice.`,
                },
            ],
        ]
        it.each(startSubscriptionOptions)(
            'should notify users of the outcome of starting the subscription: %s',
            async (
                name: string,
                confirmation_url: string | null,
                error: string | null,
                notification: Notification,
            ) => {
                const dispatchBillingError = jest.fn()
                const queryClient = mockQueryClient()

                const alteredStore = mockedStore({
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [HELPDESK_PRODUCT_ID]:
                                    basicMonthlyHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                })

                const { result } = renderHook(
                    () =>
                        useBillingPlans({
                            dispatchBillingError,
                        }),
                    {
                        wrapper: ({ children }) => (
                            <QueryClientProvider client={queryClient}>
                                <Provider store={alteredStore}>
                                    {children}
                                </Provider>
                            </QueryClientProvider>
                        ),
                    },
                )

                await act(async () =>
                    result.current.setSelectedPlans((prev) => ({
                        ...prev,
                        [ProductType.Helpdesk]: {
                            plan: basicYearlyHelpdeskPlan,
                            isSelected: true,
                        },
                    })),
                )

                // mocking API response
                mockStartSubscription.mockImplementationOnce(() =>
                    fromJS({
                        subscription: {
                            products: [],
                            status: SubscriptionStatus.ACTIVE,
                            cadence: Cadence.Month,
                            is_trialing: false,
                            trial_start_datetime: null,
                            trial_end_datetime: null,
                            has_schedule: false,
                            downgrade_scheduled: false,
                            scheduled_to_cancel_at: null,
                            current_billing_cycle_start_datetime:
                                '2016-11-14T18:30:19+00:00',
                            current_billing_cycle_end_datetime:
                                '2016-12-14T18:30:19+00:00',
                            coupon: null,
                            trial_extended_until: null,
                        },
                        payment: {
                            error,
                            confirmation_url,
                        },
                    }),
                )

                await act(async () => result.current.startSubscription())

                expect(mockStartSubscription).toHaveBeenCalledTimes(1)

                expect(notifyMock).toHaveBeenCalledWith(notification)
            },
        )
    })
})
