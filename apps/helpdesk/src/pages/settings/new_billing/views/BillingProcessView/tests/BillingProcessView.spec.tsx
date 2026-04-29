import client from '@repo/api-resources'
import { useBillingState } from '@repo/billing'
import { payingWithCreditCard } from '@repo/billing/fixtures'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render as testingRender } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan1,
    currentProductsUsage,
    customHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
    proMonthlyAutomationPlan,
    SMS_PRODUCT_ID,
    smsPlan1,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import ScheduledCancellationSummary from '../../../components/ScheduledCancellationSummary'
import SummaryTotal from '../../../components/SummaryTotal'
import useProductCancellations from '../../../hooks/useProductCancellations'
import { BillingProcessView } from '../BillingProcessView'

jest.mock('@repo/billing', () => ({
    ...jest.requireActual('@repo/billing'),
    useBillingState: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    toast: {
        success: jest.fn(),
        warning: jest.fn(),
        dismiss: jest.fn(),
    },
}))

const mockUseBillingState = assumeMock(useBillingState)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock('@repo/logging')
jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)
const logEventMock = assumeMock(logEvent)
jest.mock(
    '../../../components/ScheduledCancellationSummary/ScheduledCancellationSummary',
    () =>
        jest.fn(() => <div data-testid="scheduled-cancellation-summary"></div>),
)
jest.mock('pages/settings/new_billing/hooks/useProductCancellations')
jest.mock('pages/settings/new_billing/hooks/useIsPaymentEnabled')
jest.mock('../../../components/SummaryTotal/SummaryTotal', () =>
    jest.fn(() => <div data-testid="summary-total"></div>),
)

const ScheduledCancellationSummaryMock = assumeMock(
    ScheduledCancellationSummary,
)
const mockUseProductCancellations = assumeMock(useProductCancellations)
const mockUseIsPaymentEnabled = assumeMock(useIsPaymentEnabled)
const SummaryTotalMock = assumeMock(SummaryTotal)
const mockToastWarning = toast.warning as jest.Mock
const mockToastDismiss = toast.dismiss as jest.Mock

// Mock PendingChangesModal to capture props
jest.mock(
    'pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal',
    () => jest.fn(() => null),
)

const mockPendingChangesModal = jest.mocked(
    require('pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal'),
)

const LocationPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}

const render = (
    ui: Parameters<typeof testingRender>[0],
    options?: Parameters<typeof testingRender>[1],
) =>
    testingRender(
        <>
            {ui}
            <LocationPath />
        </>,
        {
            initialEntries: ['/app/settings/billing/manage/helpdesk'],
            path: '/app/settings/billing/:billingSection?/:selectedProduct?',
            ...options,
        },
    )

const mockedServer = new MockAdapter(client)

const storeInitialState = {
    billing: fromJS({
        invoices: [],
        products,
        currentProductsUsage: {
            helpdesk: {
                data: {
                    extra_tickets_cost_in_cents: 0,
                    num_extra_tickets: 0,
                    num_tickets: 0,
                },
                meta: {
                    subscription_start_datetime: '2021-01-01T00:00:00Z',
                    subscription_end_datetime: '2021-02-01T00:00:00Z',
                },
            },
            automation: null,
            voice: null,
            sms: null,
        },
    }),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            },
            scheduled_to_cancel_at: null,
        },
    }),
}

describe('BillingProcessView', () => {
    beforeEach(() => {
        mockUseBillingState.mockReturnValue({
            isLoading: false,
            data: undefined,
        } as any)
        mockUseProductCancellations.mockReturnValue({
            data: new Map(),
        } as any)
        useFlagMock.mockReturnValue(false)
        mockUseIsPaymentEnabled.mockReturnValue(true)
        logEventMock.mockClear()
        SummaryTotalMock.mockClear()
        mockToastWarning.mockClear()
        mockToastDismiss.mockClear()
    })

    afterEach(() => {
        mockUseProductCancellations.mockReset()
        useFlagMock.mockReset()
        mockUseIsPaymentEnabled.mockReset()
        logEventMock.mockReset()
        SummaryTotalMock.mockReset()
        mockToastWarning.mockReset()
        mockToastDismiss.mockReset()
    })

    it('should render', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: storeInitialState },
        )
        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })
    })

    it('should log BillingProductManagementVisited event on component mount', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            {
                storeState: storeInitialState,
                initialEntries: ['/app/settings/billing/manage/helpdesk'],
            },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingProductManagementVisited,
            { url: '/app/settings/billing/manage/helpdesk' },
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it('should NOT render if subscription has been canceled', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={true}
            />,
            { storeState: storeInitialState },
        )

        await waitFor(() => {
            expect(
                screen.queryByTestId('scheduled-cancellation-summary'),
            ).not.toBeInTheDocument()
        })
    })
    it('should render a scheduled cancellation summary if the subscription is scheduled to cancel', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        const scheduledToCancelAt = '2021-01-01T00:00:00Z'

        const alteredStore = {
            ...storeInitialState,
            currentAccount: fromJS({
                ...storeInitialState.currentAccount,
                current_subscription: fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                    scheduled_to_cancel_at: scheduledToCancelAt,
                }),
            }),
        } as Partial<RootState>

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: alteredStore },
        )

        await waitFor(() => {
            expect(
                screen.queryByTestId('scheduled-cancellation-summary'),
            ).toBeInTheDocument()
        })

        expect(ScheduledCancellationSummaryMock).toHaveBeenCalledWith(
            {
                scheduledToCancelAt: scheduledToCancelAt,
                onContactUs: expect.any(Function),
                cancelledProducts: ['Helpdesk'],
            },
            {},
        )
    })

    it('should evaluate payment state when rendering scheduled cancellation summary', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        const alteredStore = {
            ...storeInitialState,
            currentAccount: fromJS({
                ...storeInitialState.currentAccount,
                current_subscription: fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                    scheduled_to_cancel_at: '2021-01-01T00:00:00Z',
                }),
            }),
        } as Partial<RootState>

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: alteredStore },
        )

        await waitFor(() => {
            expect(
                screen.queryByTestId('scheduled-cancellation-summary'),
            ).toBeInTheDocument()
        })

        expect(mockUseIsPaymentEnabled).toHaveBeenCalled()
    })

    it('should track event when clicking See Plans Details link', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            {
                storeState: storeInitialState,
                initialEntries: ['/app/settings/billing/manage/helpdesk'],
            },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        logEventMock.mockClear()

        const link = screen.getByRole('link', { name: /See Plans Details/i })
        await act(() => userEvent.click(link))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansSeePlansDetailsClicked,
            { url: expect.any(String) },
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it('rejects ineligible plan selection and shows warning toast', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)
        useFlagMock.mockReturnValue(true)
        const setDefaultMessageMock = jest.fn()
        const setIsModalOpenMock = jest.fn()

        const alteredStore = {
            ...storeInitialState,
            currentAccount: fromJS({
                ...storeInitialState.currentAccount,
                current_subscription: fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicMonthlyAutomationPlan.plan_id,
                    },
                    scheduled_to_cancel_at: null,
                }),
            }),
        } as Partial<RootState>

        renderWithStoreAndQueryClientAndRouter(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={setDefaultMessageMock}
                setIsModalOpen={setIsModalOpenMock}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            alteredStore,
            { route: '/app/settings/billing/manage/helpdesk' },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        const automationPriceSelector =
            screen.getAllByLabelText('Price value')[1]
        await act(() => userEvent.click(automationPriceSelector))

        await act(() =>
            userEvent.click(
                screen.getByRole('menuitem', {
                    name: /190/i,
                }),
            ),
        )

        await waitFor(() => {
            const lastSummaryTotalCall =
                SummaryTotalMock.mock.calls[
                    SummaryTotalMock.mock.calls.length - 1
                ]
            const selectedPlans = lastSummaryTotalCall?.[0]?.selectedPlans

            expect(selectedPlans?.[ProductType.Automation]?.plan?.plan_id).toBe(
                proMonthlyAutomationPlan.plan_id,
            )
        })

        const helpdeskPriceSelector = screen.getAllByLabelText('Price value')[0]
        await act(() => userEvent.click(helpdeskPriceSelector))

        const menuitems = screen.getAllByRole('menuitem')
        const enterpriseItem = menuitems[menuitems.length - 1]
        await act(() => userEvent.click(enterpriseItem))

        await waitFor(() => {
            expect(mockToastWarning).toHaveBeenCalledWith(
                'This plan is only available through the Gorgias sales team.',
                expect.objectContaining({
                    actions: expect.any(Function),
                }),
            )
        })

        const toastOptions = mockToastWarning.mock.calls.at(-1)?.[1]
        const toastAction = toastOptions.actions({
            id: 'ineligible-plan-toast',
        }) as {
            props: {
                children: string
                onClick: () => void
                variant: string
            }
        }

        expect(toastAction.props.children).toBe('Contact support')
        expect(toastAction.props.variant).toBe('secondary')
        toastAction.props.onClick()
        expect(mockToastDismiss).toHaveBeenCalledWith('ineligible-plan-toast')
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansEnterprisePlanContactUsClicked,
        )
        expect(setDefaultMessageMock).toHaveBeenCalledWith(
            expect.stringContaining('(Enterprise)'),
        )
        expect(setIsModalOpenMock).toHaveBeenCalledWith(true)

        await waitFor(() => {
            const lastSummaryTotalCall =
                SummaryTotalMock.mock.calls[
                    SummaryTotalMock.mock.calls.length - 1
                ]
            const selectedPlans = lastSummaryTotalCall?.[0]?.selectedPlans

            expect(selectedPlans?.[ProductType.Helpdesk]?.plan?.plan_id).toBe(
                basicMonthlyHelpdeskPlan.plan_id,
            )
            expect(selectedPlans?.[ProductType.Automation]?.plan?.plan_id).toBe(
                proMonthlyAutomationPlan.plan_id,
            )
        })
        expect(
            screen.queryByRole('button', { name: /Contact Us/i }),
        ).not.toBeInTheDocument()
    })

    it('should evaluate payment state when selecting an ineligible plan', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)
        useFlagMock.mockReturnValue(true)

        renderWithStoreAndQueryClientAndRouter(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            storeInitialState,
            { route: '/app/settings/billing/manage/helpdesk' },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        const [priceSelector] = screen.getAllByLabelText('Price value')
        await act(() => userEvent.click(priceSelector))

        const menuitems = screen.getAllByRole('menuitem')
        const enterpriseItem = menuitems[menuitems.length - 1]
        await act(() => userEvent.click(enterpriseItem))

        await waitFor(() => {
            expect(mockToastWarning).toHaveBeenCalledWith(
                'This plan is only available through the Gorgias sales team.',
                expect.objectContaining({
                    actions: expect.any(Function),
                }),
            )
        })

        expect(mockUseIsPaymentEnabled).toHaveBeenCalled()
    })

    it('preserves contact-us enterprise behavior when flag is disabled', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)
        useFlagMock.mockReturnValue(false)

        const setDefaultMessageMock = jest.fn()
        const setIsModalOpenMock = jest.fn()

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={setDefaultMessageMock}
                setIsModalOpen={setIsModalOpenMock}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            {
                storeState: storeInitialState,
                initialEntries: ['/app/settings/billing/manage/helpdesk'],
            },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        const [priceSelector] = screen.getAllByLabelText('Price value')
        await act(() => userEvent.click(priceSelector))

        const menuitems = screen.getAllByRole('menuitem')
        const enterpriseItem = menuitems[menuitems.length - 1]
        await act(() => userEvent.click(enterpriseItem))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: /Contact Us/i }),
            ).toBeInTheDocument()
        })

        logEventMock.mockClear()

        const contactButton = screen.getByRole('button', {
            name: /Contact Us/i,
        })
        await act(() => userEvent.click(contactButton))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansEnterprisePlanContactUsClicked,
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(setDefaultMessageMock).toHaveBeenCalledWith(
            expect.stringContaining('Enterprise'),
        )
        expect(setIsModalOpenMock).toHaveBeenCalledWith(true)
        expect(mockToastWarning).not.toHaveBeenCalled()
    })

    describe('Product cancellations hook integration', () => {
        it('should handle unavailable cancellations data gracefully', async () => {
            mockUseProductCancellations.mockReturnValue({
                data: undefined,
            } as any)
            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeInitialState },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(mockUseProductCancellations).toHaveBeenCalled()
            expect(screen.getAllByText('Helpdesk')[0]).toBeInTheDocument()
        })

        it('should render without cancellation badges when no products are scheduled to cancel', async () => {
            mockUseProductCancellations.mockReturnValue({
                data: new Map(),
            } as any)
            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeInitialState },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
    })

    describe('Product-specific cancellations', () => {
        describe.each([
            {
                productType: ProductType.Automation,
                productName: 'Automation',
                plan: basicMonthlyAutomationPlan,
                productId: AUTOMATION_PRODUCT_ID,
                usageKey: 'automation' as const,
            },
            {
                productType: ProductType.SMS,
                productName: 'SMS',
                plan: smsPlan1,
                productId: SMS_PRODUCT_ID,
                usageKey: 'sms' as const,
            },
            {
                productType: ProductType.Voice,
                productName: 'Voice',
                plan: voicePlan1,
                productId: VOICE_PRODUCT_ID,
                usageKey: 'voice' as const,
            },
            {
                productType: ProductType.Convert,
                productName: 'Convert',
                plan: convertPlan1,
                productId: CONVERT_PRODUCT_ID,
                usageKey: 'convert' as const,
            },
        ])(
            '$productName product cancellations',
            ({ plan, productId, usageKey }) => {
                it('should display cancellation badge when product has scheduled cancellation', async () => {
                    const cancellationDate = '2025-12-31T23:59:59Z'
                    mockUseProductCancellations.mockReturnValue({
                        data: new Map([[plan.plan_id, cancellationDate]]),
                    } as any)

                    const storeForProduct = {
                        ...storeInitialState,
                        billing: fromJS({
                            invoices: [],
                            products,
                            currentProductsUsage: {
                                helpdesk: {
                                    data: {
                                        extra_tickets_cost_in_cents: 0,
                                        num_extra_tickets: 0,
                                        num_tickets: 0,
                                    },
                                    meta: {
                                        subscription_start_datetime:
                                            '2021-01-01T00:00:00Z',
                                        subscription_end_datetime:
                                            '2021-02-01T00:00:00Z',
                                    },
                                },
                                automation:
                                    usageKey === 'automation'
                                        ? currentProductsUsage.automation
                                        : null,
                                voice:
                                    usageKey === 'voice'
                                        ? currentProductsUsage.voice
                                        : null,
                                sms:
                                    usageKey === 'sms'
                                        ? currentProductsUsage.sms
                                        : null,
                                convert:
                                    usageKey === 'convert'
                                        ? currentProductsUsage.convert
                                        : null,
                            },
                        }),
                        currentAccount: fromJS({
                            current_subscription: {
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicMonthlyHelpdeskPlan.plan_id,
                                    [productId]: plan.plan_id,
                                },
                                scheduled_to_cancel_at: null,
                            },
                        }),
                    }

                    mockedServer
                        .onGet('/billing/state')
                        .reply(200, payingWithCreditCard)

                    render(
                        <BillingProcessView
                            currentUsage={currentProductsUsage}
                            contactBilling={jest.fn()}
                            dispatchBillingError={jest.fn()}
                            setDefaultMessage={jest.fn()}
                            setIsModalOpen={jest.fn()}
                            periodEnd="2021-01-01"
                            isTrialing={false}
                            isCurrentSubscriptionCanceled={false}
                        />,
                        { storeState: storeForProduct },
                    )

                    await waitFor(() => {
                        expect(
                            screen.queryByText('See Plans Details'),
                        ).toBeInTheDocument()
                    })

                    expect(
                        screen.getByText(/Active until December 31, 2025/i),
                    ).toBeInTheDocument()

                    // Verify that the cancelled product shows $0 price
                    expect(screen.getByText(/\$0/)).toBeInTheDocument()

                    // Verify that SummaryTotal receives the correct totalCancelledAmount
                    expect(SummaryTotalMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            totalCancelledAmount: plan.amount,
                        }),
                        expect.anything(),
                    )
                })

                it('should pass null when product exists but has no scheduled cancellation', async () => {
                    mockUseProductCancellations.mockReturnValue({
                        data: new Map(),
                    } as any)

                    const storeForProduct = {
                        ...storeInitialState,
                        billing: fromJS({
                            invoices: [],
                            products,
                            currentProductsUsage: {
                                helpdesk: {
                                    data: {
                                        extra_tickets_cost_in_cents: 0,
                                        num_extra_tickets: 0,
                                        num_tickets: 0,
                                    },
                                    meta: {
                                        subscription_start_datetime:
                                            '2021-01-01T00:00:00Z',
                                        subscription_end_datetime:
                                            '2021-02-01T00:00:00Z',
                                    },
                                },
                                automation:
                                    usageKey === 'automation'
                                        ? currentProductsUsage.automation
                                        : null,
                                voice:
                                    usageKey === 'voice'
                                        ? currentProductsUsage.voice
                                        : null,
                                sms:
                                    usageKey === 'sms'
                                        ? currentProductsUsage.sms
                                        : null,
                                convert:
                                    usageKey === 'convert'
                                        ? currentProductsUsage.convert
                                        : null,
                            },
                        }),
                        currentAccount: fromJS({
                            current_subscription: {
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicMonthlyHelpdeskPlan.plan_id,
                                    [productId]: plan.plan_id,
                                },
                                scheduled_to_cancel_at: null,
                            },
                        }),
                    }

                    mockedServer
                        .onGet('/billing/state')
                        .reply(200, payingWithCreditCard)

                    render(
                        <BillingProcessView
                            currentUsage={currentProductsUsage}
                            contactBilling={jest.fn()}
                            dispatchBillingError={jest.fn()}
                            setDefaultMessage={jest.fn()}
                            setIsModalOpen={jest.fn()}
                            periodEnd="2021-01-01"
                            isTrialing={false}
                            isCurrentSubscriptionCanceled={false}
                        />,
                        { storeState: storeForProduct },
                    )

                    await waitFor(() => {
                        expect(
                            screen.queryByText('See Plans Details'),
                        ).toBeInTheDocument()
                    })

                    const activeStatuses = screen.getAllByText('Active')
                    expect(activeStatuses.length).toBe(2)
                    expect(
                        screen.queryByText(/Active until/i),
                    ).not.toBeInTheDocument()

                    // Verify that active products don't show $0 price
                    expect(screen.queryByText(/^\$0$/)).not.toBeInTheDocument()

                    // Verify that SummaryTotal receives totalCancelledAmount of 0
                    expect(SummaryTotalMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            totalCancelledAmount: 0,
                        }),
                        expect.anything(),
                    )
                })
            },
        )

        it('should display cancellation badges for multiple products', async () => {
            const automationCancellation = '2025-12-31T23:59:59Z'
            const convertCancellation = '2025-11-30T23:59:59Z'

            mockUseProductCancellations.mockReturnValue({
                data: new Map([
                    [
                        basicMonthlyAutomationPlan.plan_id,
                        automationCancellation,
                    ],
                    [convertPlan1.plan_id, convertCancellation],
                ]),
            } as any)

            const storeWithMultipleProducts = {
                ...storeInitialState,
                billing: fromJS({
                    invoices: [],
                    products,
                    currentProductsUsage: {
                        helpdesk: currentProductsUsage.helpdesk,
                        automation: currentProductsUsage.automation,
                        voice: null,
                        sms: null,
                        convert: currentProductsUsage.convert,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                            [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
                        },
                        scheduled_to_cancel_at: null,
                    },
                }),
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithMultipleProducts },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByText(/Active until December 31, 2025/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Active until November 30, 2025/i),
            ).toBeInTheDocument()

            // Verify that both cancelled products show $0 price
            const zeroPrices = screen.getAllByText(/\$0/)
            expect(zeroPrices.length).toBeGreaterThanOrEqual(2)

            // Verify that SummaryTotal receives the sum of both cancelled products
            expect(SummaryTotalMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalCancelledAmount:
                        basicMonthlyAutomationPlan.amount + convertPlan1.amount,
                }),
                expect.anything(),
            )
        })

        it('should pass null when no current plan exists for product', async () => {
            mockUseProductCancellations.mockReturnValue({
                data: new Map([
                    [
                        basicMonthlyAutomationPlan.plan_id,
                        '2025-12-31T23:59:59Z',
                    ],
                ]),
            } as any)

            const storeWithoutAutomation = {
                ...storeInitialState,
                billing: fromJS({
                    invoices: [],
                    products,
                    currentProductsUsage: {
                        helpdesk: currentProductsUsage.helpdesk,
                        automation: null,
                        voice: null,
                        sms: null,
                        convert: null,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                        },
                        scheduled_to_cancel_at: null,
                    },
                }),
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithoutAutomation },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            const addProductButtons = screen.getAllByRole('button', {
                name: /Add Product/i,
            })
            expect(addProductButtons.length).toBeGreaterThan(0)
        })
    })

    describe('Edge cases', () => {
        it('should handle undefined value from hook gracefully', async () => {
            mockUseProductCancellations.mockReturnValue({
                data: undefined,
            } as any)

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeInitialState },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })

        it('should display different cancellation dates for different products', async () => {
            mockUseProductCancellations.mockReturnValue({
                data: new Map([
                    [smsPlan1.plan_id, '2025-12-31T23:59:59Z'],
                    [
                        basicMonthlyAutomationPlan.plan_id,
                        '2025-06-30T23:59:59Z',
                    ],
                ]),
            } as any)

            const storeWithBothProducts = {
                ...storeInitialState,
                billing: fromJS({
                    invoices: [],
                    products,
                    currentProductsUsage: {
                        helpdesk: currentProductsUsage.helpdesk,
                        automation: currentProductsUsage.automation,
                        voice: null,
                        sms: currentProductsUsage.sms,
                        convert: null,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                            [SMS_PRODUCT_ID]: smsPlan1.plan_id,
                        },
                        scheduled_to_cancel_at: null,
                    },
                }),
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithBothProducts },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByText(/Active until December 31, 2025/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Active until June 30, 2025/i),
            ).toBeInTheDocument()
        })

        it('should handle scenario with no products subscribed', async () => {
            mockUseProductCancellations.mockReturnValue({
                data: undefined,
            } as any)

            const storeWithNoProducts = {
                billing: fromJS({
                    invoices: [],
                    products,
                    currentProductsUsage: {
                        helpdesk: null,
                        automation: null,
                        voice: null,
                        sms: null,
                        convert: null,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {},
                        scheduled_to_cancel_at: null,
                    },
                }),
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithNoProducts },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            const addProductButtons = screen.getAllByRole('button', {
                name: /Add Product/i,
            })
            expect(addProductButtons.length).toBeGreaterThanOrEqual(4)

            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
    })

    it('should track event when PendingChangesModal is shown', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: storeInitialState },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        // Get the onShow callback from mock calls
        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        logEventMock.mockClear()

        // Simulate modal being shown
        pendingChangesModalProps?.onShow()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansPendingChangesModalShown,
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it('should track event when Update Subscription button is clicked in PendingChangesModal', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: storeInitialState },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        // Get the onSave callback from mock calls
        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        logEventMock.mockClear()

        // Simulate Update Subscription button click
        await act(async () => pendingChangesModalProps?.onSave?.())

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansPendingChangesModalClick,
            { action: 'update' },
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it('should track event when Discard button is clicked in PendingChangesModal', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: storeInitialState },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        // Get the onDiscard callback from mock calls
        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        logEventMock.mockClear()

        // Simulate Discard button click
        pendingChangesModalProps?.onDiscard()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansPendingChangesModalClick,
            { action: 'discard' },
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it('should track event when Back to Editing button is clicked in PendingChangesModal', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: storeInitialState },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        // Get the onContinueEditing callback from mock calls
        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        logEventMock.mockClear()

        // Simulate Back to Editing button click
        pendingChangesModalProps?.onContinueEditing()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansPendingChangesModalClick,
            { action: 'back' },
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it('should pass onSave to PendingChangesModal when enterprise plan is not selected', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: storeInitialState },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        expect(pendingChangesModalProps?.onSave).toBeDefined()
    })

    it('should keep onSave in PendingChangesModal when selecting an ineligible plan', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)
        useFlagMock.mockReturnValue(true)

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            {
                storeState: storeInitialState,
                initialEntries: ['/app/settings/billing/manage/helpdesk'],
            },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        const [priceSelector] = screen.getAllByLabelText('Price value')
        await act(() => userEvent.click(priceSelector))

        const menuitems = screen.getAllByRole('menuitem')
        const enterpriseItem = menuitems[menuitems.length - 1]
        await act(() => userEvent.click(enterpriseItem))

        await waitFor(() => {
            expect(mockToastWarning).toHaveBeenCalledWith(
                'This plan is only available through the Gorgias sales team.',
                expect.objectContaining({
                    actions: expect.any(Function),
                }),
            )
        })

        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        expect(pendingChangesModalProps?.onSave).toBeDefined()
    })

    it('should pass undefined for onSave in PendingChangesModal when enterprise plan is selected and flag is disabled', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)
        useFlagMock.mockReturnValue(false)

        renderWithStoreAndQueryClientAndRouter(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            storeInitialState,
            { route: '/app/settings/billing/manage/helpdesk' },
        )

        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        const [priceSelector] = screen.getAllByLabelText('Price value')
        await act(() => userEvent.click(priceSelector))

        const menuitems = screen.getAllByRole('menuitem')
        const enterpriseItem = menuitems[menuitems.length - 1]
        await act(() => userEvent.click(enterpriseItem))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: /Contact Us/i }),
            ).toBeInTheDocument()
        })

        const pendingChangesModalCalls = mockPendingChangesModal.mock.calls
        const pendingChangesModalProps =
            pendingChangesModalCalls[pendingChangesModalCalls.length - 1]?.[0]

        expect(pendingChangesModalProps?.onSave).toBeUndefined()
    })

    it('should render scheduled cancellation summary when enterprise plan subscription is scheduled to cancel', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        const scheduledToCancelAt = '2021-01-01T00:00:00Z'

        const customHelpdeskProduct = {
            type: ProductType.Helpdesk,
            prices: [customHelpdeskPlan],
        }

        const alteredStore = {
            ...storeInitialState,
            billing: fromJS({
                invoices: [],
                products: [customHelpdeskProduct, ...products.slice(1)],
                currentProductsUsage: {
                    helpdesk: {
                        data: {
                            extra_tickets_cost_in_cents: 0,
                            num_extra_tickets: 0,
                            num_tickets: 0,
                        },
                        meta: {
                            subscription_start_datetime: '2021-01-01T00:00:00Z',
                            subscription_end_datetime: '2021-02-01T00:00:00Z',
                        },
                    },
                    automation: null,
                    voice: null,
                    sms: null,
                },
            }),
            currentAccount: fromJS({
                ...storeInitialState.currentAccount,
                current_subscription: fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]: customHelpdeskPlan.plan_id,
                    },
                    scheduled_to_cancel_at: scheduledToCancelAt,
                }),
            }),
        } as Partial<RootState>

        render(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            { storeState: alteredStore },
        )

        await waitFor(() => {
            expect(
                screen.queryByTestId('scheduled-cancellation-summary'),
            ).toBeInTheDocument()
        })

        expect(ScheduledCancellationSummaryMock).toHaveBeenCalledWith(
            {
                scheduledToCancelAt: scheduledToCancelAt,
                onContactUs: expect.any(Function),
                cancelledProducts: ['Helpdesk'],
            },
            {},
        )
    })

    describe('Paused billing redirect', () => {
        it('should redirect to billing homepage when billing is paused', async () => {
            mockUseBillingState.mockReturnValue({
                isLoading: false,
                data: { subscription: { is_paused: true } },
            } as any)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeInitialState },
            )

            await waitFor(() => {
                expect(screen.getByLabelText('Current path')).toHaveTextContent(
                    '/app/settings/billing',
                )
            })
        })
    })

    describe('Yearly contract plan redirect', () => {
        it('should redirect to billing homepage when current helpdesk plan is a yearly contract plan', async () => {
            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            const yearlyContractProduct = {
                type: ProductType.Helpdesk,
                prices: [basicYearlyInvoicedMonthlyHelpdeskPlan],
            }

            const storeWithYearlyContract = {
                ...storeInitialState,
                billing: fromJS({
                    invoices: [],
                    products: [yearlyContractProduct, ...products.slice(1)],
                    currentProductsUsage: {
                        helpdesk: {
                            data: {
                                extra_tickets_cost_in_cents: 0,
                                num_extra_tickets: 0,
                                num_tickets: 0,
                            },
                            meta: {
                                subscription_start_datetime:
                                    '2021-01-01T00:00:00Z',
                                subscription_end_datetime:
                                    '2021-02-01T00:00:00Z',
                            },
                        },
                        automation: null,
                        voice: null,
                        sms: null,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                        },
                        scheduled_to_cancel_at: null,
                    },
                }),
            } as Partial<RootState>

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithYearlyContract },
            )

            await waitFor(() => {
                expect(screen.getByLabelText('Current path')).toHaveTextContent(
                    '/app/settings/billing',
                )
            })
        })

        it('should not redirect when current helpdesk plan is not a yearly contract plan', async () => {
            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeInitialState },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/billing/manage/helpdesk',
            )
        })
    })

    describe('Scheduled change blocking (mid-cycle upgrade flag)', () => {
        it('should block product with scheduled change when flag is enabled', async () => {
            useFlagMock.mockImplementation(
                (key: string) =>
                    key === FeatureFlagKey.MidCycleUpgradeBillingLogic,
            )

            const automationPlan = basicMonthlyAutomationPlan
            mockUseBillingState.mockReturnValue({
                isLoading: false,
                data: {
                    subscription: {
                        current_billing_cycle_end_datetime:
                            '2026-12-31T23:59:59Z',
                        scheduled_changes: [
                            {
                                current_plan_id: automationPlan.plan_id,
                                scheduled_change_types: ['DOWNGRADE'],
                                scheduled_plan: {
                                    ...automationPlan,
                                    plan_id: 'downgraded_plan',
                                    amount: 5000,
                                },
                            },
                        ],
                    },
                    current_plans: {
                        helpdesk: basicMonthlyHelpdeskPlan,
                        automate: automationPlan,
                        voice: null,
                        sms: null,
                        convert: null,
                    },
                },
            } as any)

            const storeWithAutomation = {
                ...storeInitialState,
                billing: fromJS({
                    invoices: [],
                    products,
                    currentProductsUsage: {
                        helpdesk: {
                            data: {
                                extra_tickets_cost_in_cents: 0,
                                num_extra_tickets: 0,
                                num_tickets: 0,
                            },
                            meta: {
                                subscription_start_datetime:
                                    '2021-01-01T00:00:00Z',
                                subscription_end_datetime:
                                    '2021-02-01T00:00:00Z',
                            },
                        },
                        automation: currentProductsUsage.automation,
                        voice: null,
                        sms: null,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]: automationPlan.plan_id,
                        },
                        scheduled_to_cancel_at: null,
                    },
                }),
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithAutomation },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByText(/Changing on December 31, 2026/i),
            ).toBeInTheDocument()
        })

        it('should preserve existing behavior when flag is disabled even with scheduled change data', async () => {
            useFlagMock.mockReturnValue(false)

            const automationPlan = basicMonthlyAutomationPlan
            mockUseBillingState.mockReturnValue({
                isLoading: false,
                data: {
                    subscription: {
                        current_billing_cycle_end_datetime:
                            '2026-12-31T23:59:59Z',
                        scheduled_changes: [
                            {
                                current_plan_id: automationPlan.plan_id,
                                scheduled_change_types: ['DOWNGRADE'],
                                scheduled_plan: {
                                    ...automationPlan,
                                    plan_id: 'downgraded_plan',
                                    amount: 5000,
                                },
                            },
                        ],
                    },
                    current_plans: {
                        helpdesk: basicMonthlyHelpdeskPlan,
                        automate: automationPlan,
                        voice: null,
                        sms: null,
                        convert: null,
                    },
                },
            } as any)

            const storeWithAutomation = {
                ...storeInitialState,
                billing: fromJS({
                    invoices: [],
                    products,
                    currentProductsUsage: {
                        helpdesk: {
                            data: {
                                extra_tickets_cost_in_cents: 0,
                                num_extra_tickets: 0,
                                num_tickets: 0,
                            },
                            meta: {
                                subscription_start_datetime:
                                    '2021-01-01T00:00:00Z',
                                subscription_end_datetime:
                                    '2021-02-01T00:00:00Z',
                            },
                        },
                        automation: currentProductsUsage.automation,
                        voice: null,
                        sms: null,
                    },
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]: automationPlan.plan_id,
                        },
                        scheduled_to_cancel_at: null,
                    },
                }),
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            render(
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />,
                { storeState: storeWithAutomation },
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('See Plans Details'),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByText(/Changing on December 31, 2026/i),
            ).not.toBeInTheDocument()

            const removeProductButton = screen.getByRole('button', {
                name: 'Remove product',
            })
            expect(removeProductButton).not.toHaveAttribute(
                'aria-disabled',
                'true',
            )
        })
    })
})
