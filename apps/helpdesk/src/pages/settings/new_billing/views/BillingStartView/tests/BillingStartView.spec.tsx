import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { resetLDMocks } from 'jest-launchdarkly-mock'
import moment from 'moment/moment'

import {
    convertStatusLimitReached,
    convertStatusOkWarning,
    convertStatusOkWarningUpgrade,
} from 'fixtures/convert'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import {
    BILLING_BASE_PATH,
    BILLING_INFORMATION_PATH,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {
    storeWithActiveSubscriptionWithConvert,
    storeWithActiveSubscriptionWithPhone,
    storeWithCanceledSubscription,
} from 'pages/settings/new_billing/fixtures'
import {
    getCurrentConvertPlan,
    getCurrentProductsUsage,
    getIsCurrentHelpdeskLegacy,
} from 'state/billing/selectors'
import {
    getCurrentAccountState,
    getCurrentSubscription,
} from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import BillingStartView from '../BillingStartView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('pages/aiAgent/hooks/useMeetAiAgentNotification')
jest.mock('hooks/useGetDateAndTimeFormat')

// Mock action creators
jest.mock('state/billing/actions', () => {
    const actions: Record<string, unknown> = jest.requireActual(
        'state/billing/actions',
    )
    return {
        ...actions,
        fetchCurrentProductsUsage: () =>
            jest.fn().mockResolvedValue({
                type: 'FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS',
            }),
    }
})

jest.mock('pages/convert/common/hooks/useGetConvertStatus')

jest.mock('../../BillingAddressSetupView/BillingAddressSetupView', () => ({
    BillingAddressSetupView: () => (
        <div data-testid="billing-address-setup-view" />
    ),
}))

jest.mock('../../PaymentMethodSetupView/PaymentMethodSetupView', () => ({
    PaymentMethodSetupView: () => (
        <div data-testid="payment-method-setup-view" />
    ),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

const mockAddBanner = jest.fn()
const mockRemoveBanner = jest.fn()
jest.mock('AlertBanners/hooks/useBanners', () => ({
    useBanners: jest.fn(() => ({
        addBanner: mockAddBanner,
        removeBanner: mockRemoveBanner,
    })),
}))

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

const now = moment()
const subscriptionStartDatetime = now.toISOString()
const subscriptionEndDatetime = now.clone().add(23, 'hours').toISOString()
const subscriptionPastEndDatetime = now
    .clone()
    .subtract(36, 'hours')
    .toISOString()

const currentSubscriptionMock = {
    products: {
        prod_MDgtHfIDbn1vMx: 'price_1',
        prod_MDgtYNmRKbSGDu: 'price_2',
        prod_MT8tZqqyMtH0zY: 'price_4',
        prod_MT93lmhVB6WeF0: 'price_5',
    },
    scheduled_to_cancel_at: null,
    start_datetime: '2024-09-20T21:49:01+00:00',
    status: 'active',
    trial_end_datetime: '2023-09-20T19:20:19+00:00',
    trial_start_datetime: '2023-09-19T18:58:16+00:00',
}

const currentUsage = {
    helpdesk: {
        data: {
            num_tickets: 60998,
            num_extra_tickets: 0,
            extra_tickets_cost_in_cents: 0,
        },
        meta: {
            subscription_start_datetime: subscriptionStartDatetime,
            subscription_end_datetime: subscriptionEndDatetime,
        },
    },
    automation: {
        data: {
            num_tickets: 20349,
            num_extra_tickets: 0,
            extra_tickets_cost_in_cents: 0,
        },
        meta: {
            subscription_start_datetime: subscriptionStartDatetime,
            subscription_end_datetime: subscriptionEndDatetime,
        },
    },
    sms: {
        data: {
            num_tickets: 12994,
            num_extra_tickets: 0,
            extra_tickets_cost_in_cents: 0,
        },
        meta: {
            subscription_start_datetime: subscriptionStartDatetime,
            subscription_end_datetime: subscriptionEndDatetime,
        },
    },
    voice: {
        data: {
            num_tickets: 10893,
            num_extra_tickets: 0,
            extra_tickets_cost_in_cents: 0,
        },
        meta: {
            subscription_start_datetime: subscriptionStartDatetime,
            subscription_end_datetime: subscriptionEndDatetime,
        },
    },
    convert: null,
}

describe('BillingStartView', () => {
    beforeEach(() => {
        mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')
        useAppSelectorMock.mockReset()
    })

    describe('When customer has no active subscription ', () => {
        beforeEach(() => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                if (selector === getCurrentConvertPlan) {
                    return {
                        num_quota_tickets: 1,
                        tier: 1,
                    }
                }

                return null
            })
        })
        it('should only show the "Usage & Plans" and "Payment History" tabs', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS({}) as Map<string, string>
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                return null
            })
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(mockAddBanner).toHaveBeenCalled()

            expect(screen.getByText(/Usage & Plans/i)).toBeInTheDocument()

            expect(screen.getByText(/Payment History/i)).toBeInTheDocument()

            expect(
                screen.queryByText(/Payment Information/i),
            ).not.toBeInTheDocument()

            expect(
                screen.queryByText(/Gorgias Internal/i),
            ).not.toBeInTheDocument()
        })

        it('should show the "Gorgias internal" tab if user is impersonated', () => {
            window.USER_IMPERSONATED = true

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_BASE_PATH,
                },
            )
            expect(screen.getByText(/Gorgias Internal/i)).toBeInTheDocument()
        })

        it('should NOT show the "Gorgias internal" tab if user is NOT impersonated', () => {
            window.USER_IMPERSONATED = null

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_BASE_PATH,
                },
            )
            expect(
                screen.queryByText(/Gorgias Internal/i),
            ).not.toBeInTheDocument()
        })
    })

    // TODO: This test go into infinite loop as hook calls setConvertBanner that triggers page rerender but as hook is expecting an object shallow compare fails and hook rerenders
    describe.skip('Convert limit banner', () => {
        const limitReachedText = "You've reached the limit for your Convert"
        const upgradeText = 'you will be auto-upgraded'
        const warningText = 'campaigns will stop being displayed'

        it('should render a Convert limit-reached banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusLimitReached)
            useAppSelectorMock.mockImplementationOnce((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                if (selector === getCurrentConvertPlan) {
                    return {
                        num_quota_tickets: 1,
                        tier: 1,
                    }
                }

                return null
            })
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                },
            )
            expect(
                screen.queryByText(limitReachedText, { exact: false }),
            ).toBeInTheDocument()
        })

        it('should render a Convert auto-upgrade warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(
                convertStatusOkWarningUpgrade,
            )

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(
                screen.queryByText(upgradeText, { exact: false }),
            ).toBeInTheDocument()
        })

        it('should render a Convert capping warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(
                screen.queryByText(warningText, { exact: false }),
            ).toBeInTheDocument()
        })

        it('should not render warming because estimation is outside of cycle', () => {
            useGetConvertStatusMock.mockReturnValue({
                ...convertStatusOkWarning,
                estimated_reach_date: '2023-04-01T00:00:00.000Z',
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(
                screen.queryByText(warningText, { exact: false }),
            ).not.toBeInTheDocument()
        })
    })

    describe('PaymentInformation phone self-serve cadence change ', () => {
        beforeEach(() => {
            resetLDMocks()

            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                if (selector === getCurrentConvertPlan) {
                    return {
                        num_quota_tickets: 1,
                        tier: 1,
                    }
                }

                return null
            })
        })

        it('should allow phone user to change billing frequency from monthly to yearly', () => {
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithPhone,
                { route: BILLING_PAYMENT_PATH },
            )

            const button = screen.queryByText('Change Frequency', {
                selector: 'a',
            })

            expect(button).toBeInTheDocument()
        })
    })

    describe('Billing Stripe Elements Integration', () => {
        beforeEach(() => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                if (selector === getCurrentConvertPlan) {
                    return {
                        num_quota_tickets: 1,
                        tier: 1,
                    }
                }

                return null
            })
        })
        it('should show the new Stripe elements address form', () => {
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_INFORMATION_PATH,
                },
            )

            expect(
                screen.getByTestId('billing-address-setup-view'),
            ).toBeInTheDocument()
        })

        it('should show the new Stripe elements payment method form', () => {
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_PAYMENT_CARD_PATH,
                },
            )

            expect(
                screen.getByTestId('payment-method-setup-view'),
            ).toBeInTheDocument()
        })
    })

    describe('SMS subscription banner', () => {
        it('should show SMS activation banner for new subscriptions', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                return null
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                {
                    ...storeWithActiveSubscriptionWithPhone,
                    integrations: {
                        ...storeWithActiveSubscriptionWithPhone.billing,
                    },
                },
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(mockAddBanner).toHaveBeenCalled()
            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        it('should not show SMS activation banner for old subscriptions', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return {
                        sms: {
                            data: { ...currentUsage.sms.data },
                            meta: {
                                subscription_start_datetime:
                                    subscriptionPastEndDatetime,
                                subscription_end_datetime:
                                    subscriptionPastEndDatetime,
                            },
                        },
                    }
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                return null
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                {
                    ...storeWithActiveSubscriptionWithPhone,
                    integrations: {
                        ...storeWithActiveSubscriptionWithPhone.billing,
                    },
                },
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(mockAddBanner).not.toHaveBeenCalled()
            expect(screen.queryByText('Set Up SMS')).not.toBeInTheDocument()
        })
    })

    describe('Voice subscription banner', () => {
        it('should show Voice activation banner for new subscriptions', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return currentUsage
                }

                if (selector === getCurrentSubscription) {
                    return fromJS({
                        ...currentSubscriptionMock,
                    }) as Map<string, string>
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                return null
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                {
                    ...storeWithActiveSubscriptionWithPhone,
                    integrations: {
                        ...storeWithActiveSubscriptionWithPhone.billing,
                    },
                },
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(mockAddBanner).toHaveBeenCalled()
            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        it('should not show Voice activation banner for old subscriptions', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getCurrentProductsUsage) {
                    return {
                        voice: {
                            data: { ...currentUsage.sms.data },
                            meta: {
                                subscription_start_datetime:
                                    subscriptionPastEndDatetime,
                                subscription_end_datetime:
                                    subscriptionPastEndDatetime,
                            },
                        },
                    }
                }

                if (selector === getCurrentSubscription) {
                    return fromJS(currentSubscriptionMock) as Map<
                        string,
                        string
                    >
                }

                if (selector === getIsCurrentHelpdeskLegacy) {
                    return false
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
                }

                if (selector === getCurrentUser) {
                    return fromJS({ email: 'test@test.com' }) as Map<
                        string,
                        string
                    >
                }

                return null
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                {
                    ...storeWithActiveSubscriptionWithPhone,
                    integrations: {
                        ...storeWithActiveSubscriptionWithPhone.billing,
                    },
                },
                {
                    route: BILLING_BASE_PATH,
                },
            )

            expect(mockAddBanner).not.toHaveBeenCalled()
            expect(mockRemoveBanner).toHaveBeenCalled()
            expect(screen.queryByText('Set Up SMS')).not.toBeInTheDocument()
        })
    })
})
