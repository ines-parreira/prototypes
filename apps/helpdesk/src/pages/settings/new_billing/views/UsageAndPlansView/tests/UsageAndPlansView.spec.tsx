import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { act } from 'react-dom/test-utils'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { useBillingState } from 'billing/hooks/useBillingState'
import { account } from 'fixtures/account'
import { shopifyIntegration } from 'fixtures/integrations'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicQuarterlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    basicYearlyInvoicedQuarterlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan1,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    products,
    SMS_PRODUCT_ID,
    smsPlan1,
    smsProduct,
    starterHelpdeskPlan,
    VOICE_PRODUCT_ID,
    voiceProduct,
} from 'fixtures/plans'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import type { HelpdeskPlan, SMSOrVoicePlan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { getCadenceName, isOtherCadenceUpgrade } from 'models/billing/utils'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { AlertType } from 'pages/common/components/Alert/Alert'
import ProductCard from 'pages/settings/new_billing/components/ProductCard'
import type { ProductCardProps } from 'pages/settings/new_billing/components/ProductCard/ProductCard'
import {
    BILLING_PAUSED_TOOLTIP,
    BILLING_PAYMENT_FREQUENCY_PATH,
    PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
} from 'pages/settings/new_billing/constants'
import {
    storeWithCanceledSubscription,
    storeWithTrialingSubscription,
} from 'pages/settings/new_billing/fixtures'
import useProductCancellations from 'pages/settings/new_billing/hooks/useProductCancellations'
import UsageAndPlansView from 'pages/settings/new_billing/views/UsageAndPlansView/UsageAndPlansView'
import { TicketPurpose } from 'state/billing/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.Mock

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
    SegmentEvent: jest.requireActual('@repo/logging').SegmentEvent,
}))

jest.mock('pages/settings/new_billing/components/ProductCard', () =>
    jest.fn((props: ProductCardProps) => {
        const dataTestId = `product-card--${props.type}`
        return <div data-testid={dataTestId}></div>
    }),
)

jest.mock(
    'pages/settings/new_billing/components/BillingScheduledDowngrades/BillingScheduledDowngrades',
    () => ({
        __esModule: true,
        default: () => <div data-testid="billing-scheduled-downgrades" />,
    }),
)

jest.mock('billing/hooks/useBillingState')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('hooks/aiAgent/useGetOrCreateAccountConfiguration')
jest.mock('pages/settings/new_billing/hooks/useProductCancellations')

const mockUseBillingState = assumeMock(useBillingState)

const mockUseGetOrCreateAccountConfiguration = assumeMock(
    useGetOrCreateAccountConfiguration,
)
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)
const mockUseStoreConfiguration = assumeMock(useStoreConfiguration)
const mockUseProductCancellations = assumeMock(useProductCancellations)

const mockedUseAiAgentOnboardingNotification = {
    isAdmin: true,
    onboardingNotificationState: undefined,
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    handleOnEnablementPostReceivedNotification: jest.fn(),
    handleOnPerformActionPostReceivedNotification: jest.fn(),
    handleOnTriggerActivateAiAgentNotification: jest.fn(),
    handleOnCancelActivateAiAgentNotification: jest.fn(),
    handleOnTriggerTrialRequestNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
}

const ProductCardMock = assumeMock(ProductCard)

const mockedUsage = {
    [ProductType.Helpdesk]: currentProductsUsage[ProductType.Helpdesk],
    [ProductType.Automation]: null,
    [ProductType.Voice]: null,
    [ProductType.SMS]: null,
    [ProductType.Convert]: currentProductsUsage[ProductType.Convert],
}
const mockedBilling = {
    invoices: [],
    products,
    currentProductsUsage: mockedUsage,
}

const mockedAccount = {
    ...account,
    current_subscription: {
        ...account.current_subscription,
        products: {
            [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
        },
        status: 'active',
    },
}

const mockedIntegrations = {
    integrations: [shopifyIntegration],
}

const store = {
    billing: fromJS(mockedBilling),
    currentAccount: fromJS(mockedAccount),
    integrations: fromJS(mockedIntegrations),
}

describe('UsageAndPlansView', () => {
    const cadenceValues = Object.values(Cadence)
    const highestCadence = cadenceValues.reduce(
        (otherCadence: Cadence, cadence: Cadence) =>
            isOtherCadenceUpgrade(cadence, otherCadence)
                ? otherCadence
                : cadence,
    )

    const helpdeskBanner = {
        description: 'Helpdesk banner',
        type: AlertType.Info,
    }

    const convertBanner = {
        description: 'Convert banner',
        type: AlertType.Info,
    }

    const smsBanner = {
        description: 'SMS banner',
        type: AlertType.Info,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseBillingState.mockReturnValue({
            isLoading: false,
            data: undefined,
        } as any)
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
            isLoading: false,
        } as unknown as ReturnType<typeof useGetOrCreateAccountConfiguration>)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            mockedUseAiAgentOnboardingNotification,
        )
        mockUseFlag.mockImplementation(() => false)
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: undefined,
            isFetched: true,
            error: null,
        })
        mockUseProductCancellations.mockReturnValue({
            loading: false,
            error: undefined,
            data: new Map(),
        } as any)
    })

    it('should render with active subscription containing Helpdesk and Convert products', () => {
        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
                helpdeskBanner={helpdeskBanner}
                convertBanner={convertBanner}
            />,
            store,
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: mockedUsage[ProductType.Helpdesk],
                banner: helpdeskBanner,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                plan: undefined,
                usage: null,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                plan: undefined,
                usage: null,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                plan: undefined,
                usage: null,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: convertPlan1,
                usage: mockedUsage[ProductType.Convert],
                banner: convertBanner,
                isDisabled: false,
                autoUpgradeEnabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )

        // and the merchant can update its plan cadence
        expect(screen.getByText('Update')).toHaveAttribute(
            'href',
            BILLING_PAYMENT_FREQUENCY_PATH,
        )
    })

    it('should render not with product cards if subscribing is disabled for the user', () => {
        mockUseFlag.mockImplementation(
            (flag) => flag === FeatureFlagKey.BillingPreventSubscriptionAnyPlan,
        )
        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
                helpdeskBanner={helpdeskBanner}
                convertBanner={convertBanner}
            />,
            store,
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(0)
    })

    it('should render with scheduled cancellation including Helpdesk and Convert products', () => {
        const alteredStore = {
            billing: fromJS(mockedBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    scheduled_to_cancel_at: '2024-01-14T22:40:22+00:00',
                },
            }),
        }
        const { container } = renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
            />,
            alteredStore,
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: mockedUsage[ProductType.Helpdesk],
                isDisabled: false,
                scheduledToCancelAt: '2024-01-14T22:40:22+00:00',
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                usage: null,
                isDisabled: true,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                usage: null,
                isDisabled: true,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                usage: null,
                isDisabled: true,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: convertPlan1,
                usage: mockedUsage[ProductType.Convert],
                isDisabled: false,
                autoUpgradeEnabled: false,
                scheduledToCancelAt: '2024-01-14T22:40:22+00:00',
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )

        // and the merchant can NOT update its plan cadence
        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency',
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
        expect(updateBillingFrequencyButton).toHaveTextContent('Update')
        expect(container).toHaveTextContent(
            'Your Helpdesk subscription has been cancelled. ' +
                'It will remain active until the end of your billing cycle on January 14, 2024.',
        )
    })

    it('should render with active subscription containing Helpdesk and SMS products', () => {
        const alteredBilling = {
            ...mockedBilling,
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]: null,
                [ProductType.Voice]: null,
                [ProductType.SMS]: {
                    data: {
                        extra_tickets_cost_in_cents: 0,
                        num_tickets: 0,
                        num_extra_tickets: 0,
                    },
                    meta: {
                        subscription_start_datetime:
                            '2024-01-22T00:46:32+00:00',
                        subscription_end_datetime: '2025-01-22T00:46:32+00:00',
                    },
                },
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = {
            billing: fromJS(alteredBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                        [SMS_PRODUCT_ID]: smsPlan1.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={alteredBilling.currentProductsUsage}
                helpdeskBanner={helpdeskBanner}
                smsBanner={smsBanner}
            />,
            alteredStore,
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: alteredBilling.currentProductsUsage[
                    ProductType.Helpdesk
                ],
                banner: helpdeskBanner,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                plan: undefined,
                usage: null,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                plan: undefined,
                usage: null,
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                plan: smsPlan1,
                usage: alteredBilling.currentProductsUsage[ProductType.SMS],
                isDisabled: false,
                banner: smsBanner,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: undefined,
                usage: null,
                isDisabled: false,
                autoUpgradeEnabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )

        // and the merchant can update its plan cadence
        expect(screen.getByText('Update')).toHaveAttribute(
            'href',
            BILLING_PAYMENT_FREQUENCY_PATH,
        )
    })

    it('should render with active subscription containing Helpdesk starter product', () => {
        const alteredBilling = {
            ...mockedBilling,
            products: [
                {
                    id: HELPDESK_PRODUCT_ID,
                    type: ProductType.Helpdesk,
                    prices: [starterHelpdeskPlan],
                },
                ...products.slice(1),
            ],
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]: null,
                [ProductType.Voice]: null,
                [ProductType.SMS]: null,
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = {
            billing: fromJS(alteredBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: starterHelpdeskPlan.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={alteredBilling.currentProductsUsage}
            />,
            alteredStore,
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: starterHelpdeskPlan,
                usage: alteredBilling.currentProductsUsage[
                    ProductType.Helpdesk
                ],
                isDisabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(screen.getByText('Update')).toHaveClass('disabledText')
    })

    it('should pass yearly helpdesk plan and tooltipDisabledCTACallback to ProductCard', () => {
        const alteredStore = {
            ...store,
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
            />,
            alteredStore,
        )

        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                type: ProductType.Helpdesk,
                plan: basicYearlyHelpdeskPlan,
                isDisabled: false,
                tooltipDisabledCTACallback: expect.any(Function),
            }),
            {},
        )
    })

    it('should not be possible to update plan frequency when there is no active subscription', () => {
        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={undefined}
            />,
            storeWithCanceledSubscription,
        )

        expect(
            screen.queryByRole('button', { name: /Update/i }),
        ).not.toBeInTheDocument()

        // When there is no active subscription, billing frequency should not be displayed
        expect(
            screen.queryByText(`Billed ${getCadenceName(Cadence.Month)}`, {
                exact: false,
            }),
        ).not.toBeInTheDocument()
    })

    it('should not be possible to update plan frequency when the user is on a the highest cadence plan', () => {
        const plan = helpdeskProduct.prices.find(
            (plan: HelpdeskPlan) => plan.cadence === highestCadence,
        )
        expect(plan).toBeDefined()
        if (plan === undefined) {
            return
        }

        const alteredStore = {
            billing: fromJS(mockedBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    status: 'trialing',
                    products: {
                        [HELPDESK_PRODUCT_ID]: plan.plan_id,
                    },
                },
            }),
        }

        const { container } = renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedBilling.currentProductsUsage}
            />,
            alteredStore,
        )

        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency',
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
    })

    it.each(
        cadenceValues.filter((cadence: Cadence) => cadence !== highestCadence),
    )(
        'should be possible to update plan frequency when the user is on a non-largest cadence phone plan and vetted for phone [cadence: %s]',
        (cadence: Cadence) => {
            const helpdeskPlan = helpdeskProduct.prices.find(
                (plan: HelpdeskPlan) =>
                    plan.cadence === cadence && plan.name !== 'Starter',
            )
            expect(helpdeskPlan).toBeDefined()
            if (helpdeskPlan === undefined) {
                return
            }

            const smsPlan = smsProduct.prices.find(
                (plan: SMSOrVoicePlan) => plan.cadence === cadence,
            )
            expect(smsPlan).toBeDefined()
            if (smsPlan === undefined) {
                return
            }

            const voicePlan = voiceProduct.prices.find(
                (plan: SMSOrVoicePlan) => plan.cadence === cadence,
            )
            expect(voicePlan).toBeDefined()
            if (voicePlan === undefined) {
                return
            }

            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        status: 'trialing',
                        products: {
                            [HELPDESK_PRODUCT_ID]: helpdeskPlan.plan_id,
                            [SMS_PRODUCT_ID]: smsPlan.plan_id,
                            [VOICE_PRODUCT_ID]: voicePlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedBilling.currentProductsUsage}
                />,
                alteredStore,
            )
            expect(screen.getByText('Update').closest('a')).toHaveAttribute(
                'href',
                BILLING_PAYMENT_FREQUENCY_PATH,
            )
        },
    )

    it('should render with product cards disabled and paused tooltip when billing is paused', () => {
        mockUseBillingState.mockReturnValue({
            isLoading: false,
            data: { subscription: { is_paused: true } },
        } as any)

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
                helpdeskBanner={helpdeskBanner}
                convertBanner={convertBanner}
            />,
            store,
        )

        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                type: ProductType.Helpdesk,
                isDisabled: true,
                disabledTooltip: BILLING_PAUSED_TOOLTIP,
            }),
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: ProductType.Automation,
                isDisabled: true,
                disabledTooltip: BILLING_PAUSED_TOOLTIP,
            }),
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                type: ProductType.Voice,
                isDisabled: true,
                disabledTooltip: BILLING_PAUSED_TOOLTIP,
            }),
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            expect.objectContaining({
                type: ProductType.SMS,
                isDisabled: true,
                disabledTooltip: BILLING_PAUSED_TOOLTIP,
            }),
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            expect.objectContaining({
                type: ProductType.Convert,
                isDisabled: true,
                disabledTooltip: BILLING_PAUSED_TOOLTIP,
            }),
            {},
        )
    })

    it('should render with the Subscribe button disabled for trialing users', () => {
        const alteredBilling = {
            ...mockedBilling,
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]: null,
                [ProductType.Voice]: null,
                [ProductType.SMS]: null,
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = {
            billing: fromJS(alteredBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    status: 'trialing',
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={alteredBilling.currentProductsUsage}
                helpdeskBanner={helpdeskBanner}
                convertBanner={convertBanner}
            />,
            alteredStore,
        )

        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: mockedUsage[ProductType.Helpdesk],
                banner: helpdeskBanner,
                isDisabled: false,
                disabledTooltip: PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                plan: undefined,
                usage: null,
                isDisabled: false,
                disabledTooltip: PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                plan: undefined,
                usage: null,
                isDisabled: true,
                disabledTooltip: PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                plan: undefined,
                usage: null,
                isDisabled: true,
                disabledTooltip: PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: undefined,
                usage: null,
                banner: convertBanner,
                isDisabled: false,
                disabledTooltip: PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
                autoUpgradeEnabled: false,
                scheduledToCancelAt: null,
                tooltipDisabledCTACallback: expect.any(Function),
            },
            {},
        )
    })

    it('should render with trialing subscription having a credit card', () => {
        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
                helpdeskBanner={helpdeskBanner}
                convertBanner={convertBanner}
            />,
            storeWithTrialingSubscription,
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)

        // and the merchant can update its plan cadence
        expect(screen.getByText('Update')).toHaveAttribute(
            'href',
            BILLING_PAYMENT_FREQUENCY_PATH,
        )
    })

    it('should pass cancellation date to ProductCard when product has scheduled cancellation', () => {
        mockUseProductCancellations.mockReturnValue({
            data: new Map([
                [basicMonthlyAutomationPlan.plan_id, '2025-12-31T23:59:59Z'],
            ]),
        } as any)

        const alteredStore = {
            billing: fromJS(mockedBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicMonthlyAutomationPlan.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
            />,
            alteredStore,
        )

        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                type: ProductType.Helpdesk,
                scheduledToCancelAt: null,
            }),
            {},
        )

        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: ProductType.Automation,
                scheduledToCancelAt: '2025-12-31T23:59:59Z',
            }),
            {},
        )
    })

    it('should pass different cancellation dates to ProductCards for multiple products', () => {
        mockUseProductCancellations.mockReturnValue({
            data: new Map([
                [basicMonthlyAutomationPlan.plan_id, '2025-12-31T23:59:59Z'],
                [convertPlan1.plan_id, '2025-11-30T23:59:59Z'],
            ]),
        } as any)

        const alteredStore = {
            billing: fromJS(mockedBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicMonthlyAutomationPlan.plan_id,
                        [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={mockedUsage}
            />,
            alteredStore,
        )

        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: ProductType.Automation,
                scheduledToCancelAt: '2025-12-31T23:59:59Z',
            }),
            {},
        )

        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            expect.objectContaining({
                type: ProductType.Convert,
                scheduledToCancelAt: '2025-11-30T23:59:59Z',
            }),
            {},
        )
    })

    describe('Whole subscription cancellation', () => {
        it('should pass subscription-level cancellation date to Helpdesk product', () => {
            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        scheduled_to_cancel_at: '2025-12-31T23:59:59Z',
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(ProductCardMock).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    type: ProductType.Helpdesk,
                    scheduledToCancelAt: '2025-12-31T23:59:59Z',
                }),
                {},
            )
        })

        it('should pass subscription-level cancellation date to all products when subscription is cancelled', () => {
            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        scheduled_to_cancel_at: '2025-11-30T23:59:59Z',
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                            [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(ProductCardMock).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    type: ProductType.Helpdesk,
                    scheduledToCancelAt: '2025-11-30T23:59:59Z',
                }),
                {},
            )

            expect(ProductCardMock).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    type: ProductType.Automation,
                    scheduledToCancelAt: '2025-11-30T23:59:59Z',
                }),
                {},
            )

            expect(ProductCardMock).toHaveBeenNthCalledWith(
                5,
                expect.objectContaining({
                    type: ProductType.Convert,
                    scheduledToCancelAt: '2025-11-30T23:59:59Z',
                }),
                {},
            )
        })

        it('should pass null to products when no subscription cancellation is scheduled', () => {
            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        scheduled_to_cancel_at: null,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(ProductCardMock).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    type: ProductType.Helpdesk,
                    scheduledToCancelAt: null,
                }),
                {},
            )

            expect(ProductCardMock).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    type: ProductType.Automation,
                    scheduledToCancelAt: null,
                }),
                {},
            )
        })
    })

    it('should trigger call for meet AI agent notification if it has an active AI Agent subscription', () => {
        const alteredBilling = {
            ...mockedBilling,
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]:
                    currentProductsUsage[ProductType.Automation],
                [ProductType.Voice]: null,
                [ProductType.SMS]: null,
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = {
            billing: fromJS(alteredBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicMonthlyAutomationPlan.plan_id,
                    },
                },
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={alteredBilling.currentProductsUsage}
            />,
            alteredStore,
        )

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(1)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'shopify-store',
            hasAutomateSubscription: true,
        })
        expect(
            mockedUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).toHaveBeenCalledTimes(1)
        expect(
            mockedUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).toHaveBeenCalledWith({
            aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
        })
    })

    describe('Tracking events', () => {
        it('should log BillingUsageAndPlansVisited event when component mounts', () => {
            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
            )

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansVisited,
                {
                    url: '/',
                },
            )
            expect(logEvent).toHaveBeenCalledTimes(1)
        })

        it('should log BillingUsageAndPlansVisited event with correct pathname', () => {
            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
                {
                    route: '/app/settings/billing',
                    path: '/app/settings/billing',
                    options: {},
                },
            )

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansVisited,
                {
                    url: '/app/settings/billing',
                },
            )
            expect(logEvent).toHaveBeenCalledTimes(1)
        })
    })

    describe('BillingUsageAndPlansChangeFrequencyClicked tracking', () => {
        it('should track event when Update frequency button is clicked', async () => {
            const logEventMock = assumeMock(logEvent)
            const user = userEvent.setup()

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                />,
                store,
            )

            const updateButton = screen.getByText('Update')

            logEventMock.mockClear()

            await act(() => user.click(updateButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansChangeFrequencyClicked,
            )
        })
    })

    describe('Billing frequency changes with product cancellations', () => {
        it('should disable frequency update when some products are scheduled to cancel', async () => {
            mockUseProductCancellations.mockReturnValue({
                loading: false,
                error: undefined,
                data: new Map([
                    [
                        basicMonthlyAutomationPlan.plan_id,
                        '2025-12-31T23:59:59Z',
                    ],
                ]),
            } as any)

            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            const { container } = renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            const updateBillingFrequencyButton = container.querySelector(
                '#update-billing-frequency',
            )
            expect(updateBillingFrequencyButton).toHaveClass('disabledText')
            expect(updateBillingFrequencyButton).toHaveTextContent('Update')

            await act(() => userEvent.hover(updateBillingFrequencyButton!))

            expect(
                screen.getByText(
                    'Some products are scheduled to cancel. To change your billing frequency or keep your products active, please',
                    { exact: false },
                ),
            )
        })

        it('should allow frequency update when no products are scheduled to cancel', () => {
            mockUseProductCancellations.mockReturnValue({
                loading: false,
                error: undefined,
                data: new Map(),
            } as any)

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
            )

            expect(screen.getByText('Update')).toHaveAttribute(
                'href',
                BILLING_PAYMENT_FREQUENCY_PATH,
            )
        })
    })

    describe('Contact us functionality', () => {
        it('should call contactBilling when contact us link is clicked', async () => {
            const mockContactBilling = jest.fn()
            const user = userEvent.setup()

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={mockContactBilling}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
            )

            const contactUsLink = screen.getByText('contact us')

            await act(() => user.click(contactUsLink))

            expect(mockContactBilling).toHaveBeenCalledWith(
                TicketPurpose.CONTACT_US,
            )
        })
    })

    describe('BillingScheduledDowngrades', () => {
        it('should render BillingScheduledDowngrades when subscription is active', () => {
            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
            )

            expect(
                screen.getByTestId('billing-scheduled-downgrades'),
            ).toBeInTheDocument()
        })

        it('should not render BillingScheduledDowngrades when subscription is canceled', () => {
            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={undefined}
                />,
                storeWithCanceledSubscription,
            )

            expect(
                screen.queryByTestId('billing-scheduled-downgrades'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Payment plan label display', () => {
        it('should display "Billed Monthly" for standard monthly plan', () => {
            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
            )

            expect(screen.getByText('Billed Monthly')).toBeInTheDocument()
        })

        it('should display "Billed Quarterly" for standard quarterly plan', () => {
            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicQuarterlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(screen.getByText('Billed Quarterly')).toBeInTheDocument()
        })

        it('should display "Billed Yearly" for standard yearly plan', () => {
            const alteredStore = {
                billing: fromJS(mockedBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(screen.getByText('Billed Yearly')).toBeInTheDocument()
        })

        it('should display "Annual plan (billed quarterly)" for custom yearly plan billed quarterly', () => {
            const alteredStore = {
                billing: fromJS({
                    ...mockedBilling,
                    products: [
                        {
                            type: ProductType.Helpdesk,
                            prices: [
                                ...helpdeskProduct.prices,
                                basicYearlyInvoicedQuarterlyHelpdeskPlan,
                            ],
                        },
                        ...products.slice(1),
                    ],
                }),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyInvoicedQuarterlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(
                screen.getByText('Annual plan (billed quarterly)'),
            ).toBeInTheDocument()
        })

        it('should display "Annual plan (billed monthly)" for custom yearly plan billed monthly', () => {
            const alteredStore = {
                billing: fromJS({
                    ...mockedBilling,
                    products: [
                        {
                            type: ProductType.Helpdesk,
                            prices: [
                                ...helpdeskProduct.prices,
                                basicYearlyInvoicedMonthlyHelpdeskPlan,
                            ],
                        },
                        ...products.slice(1),
                    ],
                }),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(
                screen.getByText('Annual plan (billed monthly)'),
            ).toBeInTheDocument()
        })
    })

    describe('CustomPlanBanner', () => {
        it('should render CustomPlanBanner for custom yearly plan', async () => {
            const alteredBilling = {
                ...mockedBilling,
                products: [
                    {
                        id: HELPDESK_PRODUCT_ID,
                        type: ProductType.Helpdesk,
                        prices: [basicYearlyInvoicedQuarterlyHelpdeskPlan],
                    },
                    ...products.slice(1),
                ],
            }

            const alteredStore = {
                billing: fromJS(alteredBilling),
                integrations: fromJS(mockedIntegrations),
                currentAccount: fromJS({
                    ...mockedAccount,
                    current_subscription: {
                        ...mockedAccount.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyInvoicedQuarterlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                alteredStore,
            )

            expect(await screen.findByText('Contact us')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeInTheDocument()
        })

        it('should not render CustomPlanBanner for monthly plan', () => {
            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                store,
            )

            expect(
                screen.queryByText(
                    /Because you're on a custom plan, please contact our team to make changes to your subscription/i,
                ),
            ).not.toBeInTheDocument()
        })

        it('should not render CustomPlanBanner when subscription is canceled', () => {
            const alteredBilling = {
                ...mockedBilling,
                products: [
                    {
                        id: HELPDESK_PRODUCT_ID,
                        type: ProductType.Helpdesk,
                        prices: [basicYearlyInvoicedMonthlyHelpdeskPlan],
                    },
                    ...products.slice(1),
                ],
            }

            renderWithStoreAndQueryClientAndRouter(
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={mockedUsage}
                />,
                {
                    ...storeWithCanceledSubscription,
                    billing: fromJS(alteredBilling),
                },
            )

            expect(
                screen.queryByText(
                    /Because you're on a custom plan, please contact our team to make changes to your subscription/i,
                ),
            ).not.toBeInTheDocument()
        })
    })
})
