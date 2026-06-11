import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
    useBillingState,
} from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan5,
    HELPDESK_PRODUCT_ID,
    SMS_PRODUCT_ID,
    smsPlan2,
    VOICE_PRODUCT_ID,
    voicePlan2,
} from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'
import {
    getShopifyBillingStatus,
    shouldPayWithShopify,
} from 'state/currentAccount/selectors'
import { ShopifyBillingStatus } from 'state/currentAccount/types'
import type { RootState } from 'state/types'

import { useBillingPlans } from '../../../hooks/useBillingPlan'
import { useProductCancellations } from '../../../hooks/useProductCancellations'
import { BillingFrequencyView } from '../BillingFrequencyView'

jest.mock('../../../components/ConfirmChangesModal', () => ({
    ConfirmChangesModal: jest
        .requireActual(
            '../../../components/ConfirmChangesModal/tests/mockConfirmChangesModal',
        )
        .mockConfirmChangesModalComponent(),
}))
jest.mock('state/currentAccount/selectors', () => ({
    ...jest.requireActual('state/currentAccount/selectors'),
    shouldPayWithShopify: jest.fn(),
    getShopifyBillingStatus: jest.fn(),
}))
jest.mock('../../../hooks/useIsPaymentEnabled', () => ({
    useIsPaymentEnabled: jest.fn(() => true),
}))
jest.mock('../../../hooks/useBillingPlan', () => ({
    useBillingPlans: jest.fn(),
}))
jest.mock('../../../hooks/useProductCancellations')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
    reportError: jest.fn(),
    SegmentEvent: {
        BillingPaymentInformationSubscriptionFrequencyUpdated:
            'billing-payment-information-subscription-frequency-updated',
        BillingPaymentInformationBillingFrequencyVisited:
            'billing-payment-information-billing-frequency-visited',
        BillingPaymentInformationFrequencyChanged:
            'billing-payment-information-frequency-changed',
    },
}))
jest.mock('@repo/billing', () => ({
    ...jest.requireActual('@repo/billing'),
    useBillingState: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: () => jest.fn() }))
jest.mock('state/notifications/actions')
const mockUseFlag = useFlag as jest.Mock
const mockUseBillingState = assumeMock(useBillingState)
const mockUseBillingPlans = assumeMock(useBillingPlans)
const mockUseProductCancellations = assumeMock(useProductCancellations)
const mockReportError = assumeMock(reportError)
const mockShouldPayWithShopify = shouldPayWithShopify as unknown as jest.Mock
const mockGetShopifyBillingStatus =
    getShopifyBillingStatus as unknown as jest.Mock
const billingFrequencyRoute = `${BILLING_BASE_PATH}/manage/helpdesk`
const LocationPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
type CustomerPaymentMethods = {
    credit_card?: unknown
    ach_debit_bank_account?: unknown
    ach_credit_bank_account?: unknown
}
function setBillingStateWithPaymentMethods(customer: CustomerPaymentMethods) {
    mockUseBillingState.mockReturnValue({
        isLoading: false,
        data: {
            subscription: {
                is_paused: false,
                scheduled_changes: [],
                downgrades: [],
                resource_version: 12345,
                schedule_resource_version: 67890,
            },
            customer,
        },
    } as any)
}
function makeGorgiasApiError(msg: string) {
    const headers = new AxiosHeaders()
    const error = new AxiosError(
        'Request failed with status code 400',
        'ERR_BAD_REQUEST',
    )
    error.response = {
        data: { error: { msg, data: null } },
        status: 400,
        statusText: 'Bad Request',
        headers: headers.toJSON() as never,
        config: { headers } as never,
    }
    return error
}
function makePendingInvoiceError() {
    return makeGorgiasApiError(
        'Proration cannot be performed until all pending invoices are resolved.',
    )
}
function makeVersionConflictError() {
    return makeGorgiasApiError(
        'subscription has been modified since it was last retrieved',
    )
}
const defaultStore: DeepPartial<RootState> = {
    billing: fromJS(billingState),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.plan_id,
                [VOICE_PRODUCT_ID]: voicePlan2.plan_id,
                [SMS_PRODUCT_ID]: smsPlan2.plan_id,
                [CONVERT_PRODUCT_ID]: convertPlan5.plan_id,
            },
        },
    }),
}
function setFeatureFlags(flags: Partial<Record<FeatureFlagKey, boolean>>) {
    mockUseFlag.mockImplementation(
        (flag: FeatureFlagKey) => flags[flag] ?? false,
    )
}
function mockPlansHook(
    overrides: {
        updateSubscription?: jest.Mock
        isSubscriptionUpdating?: boolean
    } = {},
) {
    const updateSubscription =
        overrides.updateSubscription ?? jest.fn().mockResolvedValue(undefined)
    mockUseBillingPlans.mockReturnValue({
        currentHelpdeskPlan: basicMonthlyHelpdeskPlan,
        currentAutomatePlan: null,
        currentVoicePlan: null,
        currentSmsPlan: null,
        currentConvertPlan: null,
        helpdeskAvailablePlans: [
            basicMonthlyHelpdeskPlan,
            basicYearlyHelpdeskPlan,
        ],
        automateAvailablePlans: [],
        voiceAvailablePlans: [],
        smsAvailablePlans: [],
        convertAvailablePlans: [],
        cadence: Cadence.Month,
        selectedPlans: {
            [ProductType.Helpdesk]: {
                plan: basicMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: { isSelected: false },
            [ProductType.Voice]: { isSelected: false },
            [ProductType.SMS]: { isSelected: false },
            [ProductType.Convert]: { isSelected: false },
        },
        setSelectedPlans: jest.fn(),
        totalProductAmount: basicMonthlyHelpdeskPlan.amount,
        anyProductChanged: true,
        updateSubscription,
        isSubscriptionUpdating: overrides.isSubscriptionUpdating ?? false,
    } as any)
    return { updateSubscription }
}
function renderView(
    isTrialing = false,
    propOverrides: {
        dispatchBillingError?: jest.Mock
    } = {},
) {
    return render(
        <>
            <BillingFrequencyView
                isTrialing={isTrialing}
                isCurrentSubscriptionCanceled={false}
                periodEnd="2021-01-01"
                contactBilling={jest.fn()}
                dispatchBillingError={
                    propOverrides.dispatchBillingError ?? jest.fn()
                }
            />
            <LocationPath />
        </>,
        {
            initialEntries: [billingFrequencyRoute],
            path: `${BILLING_BASE_PATH}/:section?/:selectedProduct?`,
            storeState: defaultStore,
        },
    )
}
describe('BillingFrequencyView submit flow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setBillingStateWithPaymentMethods({ credit_card: { last4: '4242' } })
        mockUseProductCancellations.mockReturnValue({
            data: new Map(),
        } as any)
        mockShouldPayWithShopify.mockReturnValue(false)
        mockGetShopifyBillingStatus.mockReturnValue(ShopifyBillingStatus.Active)
        setFeatureFlags({
            [FeatureFlagKey.BillingQuarterlyFrequency]: true,
            [FeatureFlagKey.MidCycleUpgradeBillingLogic]: false,
        })
    })
    describe('flag off (direct CTA)', () => {
        it('clicking Update Subscription calls updateSubscription, shows success toast, and redirects to BILLING_BASE_PATH', async () => {
            const user = userEvent.setup()
            const { updateSubscription } = mockPlansHook()
            renderView()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Update Subscription' }),
                ),
            )
            await waitFor(() => {
                expect(updateSubscription).toHaveBeenCalledTimes(1)
            })
            expect(
                await screen.findByRole('status', {
                    name: 'Your subscription has successfully been updated.',
                }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                BILLING_BASE_PATH,
            )
        })
        it('redirects to BILLING_PAYMENT_CARD_PATH when trialing', async () => {
            const user = userEvent.setup()
            mockPlansHook()
            renderView(true)
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Update Subscription' }),
                ),
            )
            await waitFor(() => {
                expect(screen.getByLabelText('Current path')).toHaveTextContent(
                    BILLING_PAYMENT_CARD_PATH,
                )
            })
        })
        it('reports the error when updateSubscription rejects, without redirecting (legacy SummaryFooter path — no error toast)', async () => {
            const user = userEvent.setup()
            const updateSubscription = jest
                .fn()
                .mockRejectedValue(new Error('API down'))
            mockPlansHook({ updateSubscription })
            renderView()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Update Subscription' }),
                ),
            )
            await waitFor(() => {
                expect(mockReportError).toHaveBeenCalledWith(expect.any(Error))
            })
            expect(
                screen.queryByRole('status', {
                    name: 'Your subscription has successfully been updated.',
                }),
            ).not.toBeInTheDocument()
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                billingFrequencyRoute,
            )
        })
        it('does not dispatch billing-state load errors when the mid-cycle upgrade flag is off', () => {
            const dispatchBillingError = jest.fn()
            mockUseBillingState.mockReturnValue({
                isLoading: false,
                isError: true,
                error: new Error('billing state unavailable'),
                data: undefined,
            } as any)
            mockPlansHook()
            renderView(false, { dispatchBillingError })
            expect(dispatchBillingError).not.toHaveBeenCalled()
        })
        it('passes the real dispatchBillingError to useBillingPlans (legacy path owns update-error toast)', () => {
            const dispatchBillingError = jest.fn()
            mockPlansHook()
            renderView(false, { dispatchBillingError })
            const { dispatchBillingError: forwarded } =
                mockUseBillingPlans.mock.calls[0][0]
            forwarded(new Error('update failed'))
            expect(dispatchBillingError).toHaveBeenCalledTimes(1)
        })
    })
    describe('flag on (modal confirm)', () => {
        beforeEach(() => {
            setFeatureFlags({
                [FeatureFlagKey.BillingQuarterlyFrequency]: true,
                [FeatureFlagKey.MidCycleUpgradeBillingLogic]: true,
            })
        })
        it('surfaces billing-state load errors via dispatchBillingError', () => {
            const dispatchBillingError = jest.fn()
            const fetchError = new Error('billing state unavailable')
            mockUseBillingState.mockReturnValue({
                isLoading: false,
                isError: true,
                error: fetchError,
                data: undefined,
            } as any)
            mockPlansHook()
            renderView(false, { dispatchBillingError })
            expect(dispatchBillingError).toHaveBeenCalledWith(fetchError)
        })
        it('passes a no-op dispatchBillingError to useBillingPlans so update failures do not double-toast with handleSubmit', () => {
            const dispatchBillingError = jest.fn()
            mockPlansHook()
            renderView(false, { dispatchBillingError })
            const { dispatchBillingError: forwarded } =
                mockUseBillingPlans.mock.calls[0][0]
            forwarded(new Error('update failed'))
            expect(dispatchBillingError).not.toHaveBeenCalled()
        })
        it('closes the modal and redirects on successful confirm', async () => {
            const user = userEvent.setup()
            const { updateSubscription } = mockPlansHook()
            renderView()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Update Subscription' }),
                ),
            )
            expect(screen.getByText('confirm modal open')).toBeInTheDocument()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'confirm changes' }),
                ),
            )
            await waitFor(() => {
                expect(updateSubscription).toHaveBeenCalledTimes(1)
            })
            await waitFor(() => {
                expect(
                    screen.getByText('confirm modal closed'),
                ).toBeInTheDocument()
            })
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                BILLING_BASE_PATH,
            )
        })
        describe.each([
            [
                'pending invoice',
                makePendingInvoiceError,
                'pending invoice error',
            ],
            [
                'version conflict',
                makeVersionConflictError,
                'version conflict error',
            ],
        ])('%s blocking state', (_name, makeError, bannerText) => {
            async function submitViaModal(
                user: ReturnType<typeof userEvent.setup>,
            ) {
                await act(() =>
                    user.click(
                        screen.getByRole('button', {
                            name: 'Update Subscription',
                        }),
                    ),
                )
                await act(() =>
                    user.click(
                        screen.getByRole('button', {
                            name: 'confirm changes',
                        }),
                    ),
                )
            }
            it('surfaces the typed error banner and skips toast + reportError', async () => {
                const user = userEvent.setup()
                mockPlansHook({
                    updateSubscription: jest
                        .fn()
                        .mockRejectedValue(makeError()),
                })
                renderView()
                await submitViaModal(user)
                await waitFor(() => {
                    expect(screen.getByText(bannerText)).toBeInTheDocument()
                })
                expect(mockReportError).not.toHaveBeenCalled()
                expect(
                    screen.queryByRole('status', {
                        name: 'Your subscription has successfully been updated.',
                    }),
                ).not.toBeInTheDocument()
            })
            it('clears the banner when the modal is closed and reopened', async () => {
                const user = userEvent.setup()
                mockPlansHook({
                    updateSubscription: jest
                        .fn()
                        .mockRejectedValue(makeError()),
                })
                renderView()
                await submitViaModal(user)
                await waitFor(() => {
                    expect(screen.getByText(bannerText)).toBeInTheDocument()
                })
                await act(() =>
                    user.click(
                        screen.getByRole('button', { name: 'close modal' }),
                    ),
                )
                await act(() =>
                    user.click(
                        screen.getByRole('button', {
                            name: 'Update Subscription',
                        }),
                    ),
                )
                expect(screen.queryByText(bannerText)).not.toBeInTheDocument()
            })
        })
        it('non-typed errors: reports + dispatches billing-error notification, keeps modal open, no redirect, no banners', async () => {
            const user = userEvent.setup()
            const dispatchBillingError = jest.fn()
            const apiError = new Error('API down')
            mockPlansHook({
                updateSubscription: jest.fn().mockRejectedValue(apiError),
            })
            renderView(false, { dispatchBillingError })
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Update Subscription' }),
                ),
            )
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'confirm changes' }),
                ),
            )
            await waitFor(() => {
                expect(mockReportError).toHaveBeenCalledWith(apiError)
            })
            expect(dispatchBillingError).toHaveBeenCalledWith(apiError)
            expect(
                screen.queryByRole('status', {
                    name: 'Your subscription has successfully been updated.',
                }),
            ).not.toBeInTheDocument()
            expect(screen.getByText('confirm modal open')).toBeInTheDocument()
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                billingFrequencyRoute,
            )
            expect(
                screen.queryByText('pending invoice error'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('version conflict error'),
            ).not.toBeInTheDocument()
        })
        describe('payment method gating', () => {
            type Case = {
                name: string
                setup: () => void
                trialing?: boolean
                shouldFlag: boolean
            }
            const cases: Case[] = [
                {
                    name: 'active stripe sub without card or ACH flags missing',
                    setup: () => setBillingStateWithPaymentMethods({}),
                    shouldFlag: true,
                },
                {
                    name: 'card-only does not flag',
                    setup: () =>
                        setBillingStateWithPaymentMethods({
                            credit_card: { last4: '4242' },
                        }),
                    shouldFlag: false,
                },
                {
                    name: 'ACH-only does not flag',
                    setup: () =>
                        setBillingStateWithPaymentMethods({
                            ach_debit_bank_account: { id: 'ba_1' },
                        }),
                    shouldFlag: false,
                },
                {
                    name: 'shopify sub with inactive billing flags missing',
                    setup: () => {
                        mockShouldPayWithShopify.mockReturnValue(true)
                        mockGetShopifyBillingStatus.mockReturnValue(
                            ShopifyBillingStatus.Inactive,
                        )
                        setBillingStateWithPaymentMethods({})
                    },
                    shouldFlag: true,
                },
                {
                    name: 'trialing suppresses the flag',
                    setup: () => setBillingStateWithPaymentMethods({}),
                    trialing: true,
                    shouldFlag: false,
                },
            ]
            it.each(cases)('$name', async ({ setup, trialing, shouldFlag }) => {
                const user = userEvent.setup()
                setup()
                mockPlansHook()
                renderView(trialing)
                await act(() =>
                    user.click(
                        screen.getByRole('button', {
                            name: 'Update Subscription',
                        }),
                    ),
                )
                if (shouldFlag) {
                    expect(
                        screen.getByText('payment method missing'),
                    ).toBeInTheDocument()
                } else {
                    expect(
                        screen.queryByText('payment method missing'),
                    ).not.toBeInTheDocument()
                }
            })
        })
    })
})
