import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import * as uiKit from '@gorgias/axiom'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { shopifyIntegration } from 'fixtures/integrations'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan1,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    products,
    SMS_PRODUCT_ID,
    smsPlan1,
    starterHelpdeskPlan,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/productPrices'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import { ProductType } from 'models/billing/types'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { AlertType } from 'pages/common/components/Alert/Alert'
import ProductCard from 'pages/settings/new_billing/components/ProductCard'
import { ProductCardProps } from 'pages/settings/new_billing/components/ProductCard/ProductCard'
import { PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP } from 'pages/settings/new_billing/constants'
import {
    storeWithCanceledSubscription,
    storeWithTrialingSubscription,
} from 'pages/settings/new_billing/fixtures'
import UsageAndPlansView from 'pages/settings/new_billing/views/UsageAndPlansView/UsageAndPlansView'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

// Mock ui-kit as an ES module to enable spying
jest.mock('@gorgias/axiom', () => {
    return {
        __esModule: true,
        ...jest.requireActual('@gorgias/axiom'),
    } as Record<string, unknown>
})

jest.mock('pages/settings/new_billing/components/ProductCard', () =>
    jest.fn((props: ProductCardProps) => {
        const dataTestId = `product-card--${props.type}`
        return <div data-testid={dataTestId}></div>
    }),
)

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('hooks/aiAgent/useGetOrCreateAccountConfiguration')

const mockUseGetOrCreateAccountConfiguration = assumeMock(
    useGetOrCreateAccountConfiguration,
)
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)
const mockUseStoreConfiguration = assumeMock(useStoreConfiguration)

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
            [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
            [CONVERT_PRODUCT_ID]: convertPlan1.price_id,
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
    const MockTooltip = jest.spyOn(uiKit, 'Tooltip')

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
            },
            {},
        )

        // and the merchant can update its plan cadence from monthly to yearly
        expect(screen.getByText('Update')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/frequency',
        )
    })

    it('should render not with product cards if subscribing is disabled for the user', () => {
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.BillingPreventSubscriptionAnyPlan
                ? true
                : false,
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
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                usage: null,
                isDisabled: true,
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                usage: null,
                isDisabled: true,
            },
            {},
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                usage: null,
                isDisabled: true,
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
            },
            {},
        )

        // and the merchant can NOT update its plan cadence from monthly to yearly
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
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                        [SMS_PRODUCT_ID]: smsPlan1.price_id,
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
            },
            {},
        )

        // and the merchant can update its plan cadence from monthly to yearly
        expect(screen.getByText('Update').closest('a')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/frequency',
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
                        [HELPDESK_PRODUCT_ID]: starterHelpdeskPlan.price_id,
                    },
                },
            }),
        }

        const { container } = renderWithStoreAndQueryClientAndRouter(
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
                isDisabled: true,
            },
            {},
        )
        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency',
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
        expect(updateBillingFrequencyButton).toHaveTextContent('Update')
        expect(MockTooltip).toHaveBeenCalledWith(
            {
                autohide: false,
                children:
                    'To change billing frequency, upgrade your Helpdesk plan to Basic or higher',
                className: 'tooltip',
                placement: 'top',
                target: 'update-billing-frequency',
            },
            {},
        )
    })

    it('should not be possible to update plan frequency when there is no active subscription', () => {
        renderWithStoreAndQueryClientAndRouter(
            <UsageAndPlansView
                contactBilling={jest.fn()}
                periodEnd="2021-01-01"
                currentUsage={null}
            />,
            storeWithCanceledSubscription,
        )

        expect(
            screen.queryByRole('button', { name: /Update/i }),
        ).not.toBeInTheDocument()

        expect(screen.queryByText(/Billed monthly/i)).toBeInTheDocument()
    })

    it('should not be possible to update plan frequency when the user is on a yearly plan', () => {
        const alteredStore = {
            billing: fromJS(mockedBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    status: 'trialing',
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.price_id,
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

    it('should be possible to update plan frequency when the user is on a phone monthly plan and vetted for phone', () => {
        const alteredStore = {
            billing: fromJS(mockedBilling),
            integrations: fromJS(mockedIntegrations),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    status: 'trialing',
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                        [SMS_PRODUCT_ID]: smsPlan1.price_id,
                        [VOICE_PRODUCT_ID]: voicePlan1.price_id,
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
            'to',
            '/app/settings/billing/payment/frequency',
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
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
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
                autoUpgradeEnabled: false,
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

        // and the merchant can update its plan cadence from monthly to yearly
        expect(screen.getByText('Update')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/frequency',
        )
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
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicMonthlyAutomationPlan.price_id,
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
})
