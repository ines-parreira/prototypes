import { assumeMock } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import { default as userEvent } from '@testing-library/user-event'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppSelector from 'hooks/useAppSelector'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'

import { TrialType } from '../../types/ShoppingAssistant'
import { TrialProgressModals } from '../TrialProgressModals'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))

jest.mock('common/segment/segment', () => ({
    logEvent: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('models/billing/queries')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')

jest.mock(
    'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal',
    () => ({
        TrialEndingModal: ({ storeName }: { storeName: string }) => (
            <div>Trial Ending Modal for {storeName}</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal',
    () => ({
        TrialManageModal: ({
            title,
            onClose,
            primaryAction,
            secondaryAction,
        }: {
            title: string
            onClose: () => void
            primaryAction?: { label: string; onClick: () => void }
            secondaryAction?: { label: string; onClick: () => void }
        }) => (
            <div>
                <h2>{title}</h2>
                <button onClick={onClose}>Close</button>
                {primaryAction && (
                    <button onClick={primaryAction.onClick}>
                        {primaryAction.label}
                    </button>
                )}
                {secondaryAction && (
                    <button onClick={secondaryAction.onClick}>
                        {secondaryAction.label}
                    </button>
                )}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/TrialOptOutModal/TrialOptOutModal',
    () => ({
        __esModule: true,
        default: ({
            isOpen,
            onClose,
            onRequestTrialExtension,
        }: {
            isOpen: boolean
            onClose: (extendTrialRequestSent: boolean) => void
            onRequestTrialExtension: () => void
        }) =>
            isOpen ? (
                <div>
                    <h2>Trial Opt Out Modal</h2>
                    <button onClick={() => onClose(false)}>Close</button>
                    <button onClick={() => onClose(true)}>
                        Request Trial Extension
                    </button>
                    <button onClick={onRequestTrialExtension}>
                        Request Extension
                    </button>
                </div>
            ) : null,
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal',
    () => ({
        UpgradePlanModal: ({
            onClose,
            onConfirm,
            onDismiss,
            isLoading,
        }: {
            onClose: () => void
            onConfirm: () => void
            onDismiss: () => void
            isLoading: boolean
        }) => (
            <div>
                <h2>Upgrade Plan Modal</h2>
                <button onClick={onClose}>Close</button>
                <button onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Confirm Upgrade'}
                </button>
                <button onClick={onDismiss}>Dismiss</button>
            </div>
        ),
    }),
)

describe('TrialProgressModals', () => {
    const mockUseAppSelector = assumeMock(useAppSelector)
    const mockUseStoreActivations = assumeMock(useStoreActivations)
    const mockUseShoppingAssistantTrialFlow = assumeMock(
        useShoppingAssistantTrialFlow,
    )
    const mockUseTrialModalProps = assumeMock(useTrialModalProps)
    const mockUseUpgradePlan = assumeMock(useUpgradePlan)
    const mockUseEarlyAccessAutomatePlan = assumeMock(
        useEarlyAccessAutomatePlan,
    )
    const mockLogEvent = assumeMock(logEvent)

    const defaultMockValues = {
        currentAccount: { get: jest.fn().mockReturnValue('test-domain.com') },
        storeActivations: {} as Record<string, any>,
        shoppingAssistantTrialFlow: getUseShoppingAssistantTrialFlowFixture(),
        upgradePlan: {
            upgradePlan: jest.fn(),
            upgradePlanAsync: jest.fn(),
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        },
        trialModalProps: {
            trialUpgradePlanModal: {
                title: 'Test',
                currentPlan: {
                    title: 'Current',
                    description: 'Current plan',
                    price: '$0',
                    currency: 'USD',
                    billingPeriod: Cadence.Month,
                    advantages: [],
                    buttonText: 'Keep',
                    features: [],
                },
                newPlan: {
                    title: 'New',
                    description: 'New plan',
                    price: '$10',
                    currency: 'USD',
                    billingPeriod: Cadence.Month,
                    advantages: [],
                    buttonText: 'Upgrade',
                    features: [],
                },
            },
            upgradePlanModal: {
                title: 'Test',
                currentPlan: {
                    title: 'Current',
                    description: 'Current plan',
                    price: '$0',
                    currency: 'USD',
                    billingPeriod: Cadence.Month,
                    advantages: [],
                    buttonText: 'Keep',
                    features: [],
                },
                newPlan: {
                    title: 'New',
                    description: 'New plan',
                    price: '$10',
                    currency: 'USD',
                    billingPeriod: Cadence.Month,
                    advantages: [],
                    buttonText: 'Upgrade',
                    features: [],
                },
            },
            trialActivatedModal: { title: 'Test' },
            trialStartedBanner: { title: 'Test', description: 'Test' },
            trialAlertBanner: { title: 'Test', description: 'Test' },
            trialEndingModal: {
                title: 'Test',
                description: 'Test',
                advantages: [],
                secondaryDescription: 'Test',
            },
            trialEndedModal: {
                title: 'Test',
                description: 'Test',
                advantages: [],
                secondaryDescription: 'Test',
            },
            trialFinishSetupModal: {
                title: 'Test',
                subtitle: 'Test',
                content: '',
                primaryAction: { label: 'Test', onClick: jest.fn() },
            },
            newTrialUpgradePlanModal: {
                title: 'Test',
                subtitle: 'Test',
                currentPlan: {
                    title: 'Current',
                    description: 'Current plan',
                    price: '$0',
                    currency: 'USD',
                    billingPeriod: Cadence.Month,
                    advantages: [],
                    buttonText: 'Keep',
                    features: [],
                },
                newPlan: {
                    title: 'New',
                    description: 'New plan',
                    price: '$10',
                    currency: 'USD',
                    billingPeriod: Cadence.Month,
                    advantages: [],
                    buttonText: 'Upgrade',
                    features: [],
                },
                primaryAction: { label: 'Test', onClick: jest.fn() },
                secondaryAction: { label: 'Test', onClick: jest.fn() },
                onClose: jest.fn(),
                features: [
                    {
                        icon: 'check',
                        title: 'Today',
                        description: 'Test feature description',
                    },
                ],
            },
            trialRequestModal: {
                title: 'Test',
                subtitle: 'Test',
                primaryCTALabel: 'Test',
                accountAdmins: [],
                onPrimaryAction: jest.fn(),
            },
        },
        earlyAccessPlan: {
            data: null,
            isLoading: false as const,
            isError: false as const,
            error: null,
            isSuccess: true as const,
            status: 'success' as const,
            isFetching: false,
            isStale: false,
            dataUpdatedAt: 0,
            errorUpdatedAt: 0,
            errorUpdateCount: 0,
            failureCount: 0,
            failureReason: null,
            fetchStatus: 'idle' as const,
            isInitialLoading: false,
            isFetched: true,
            isFetchedAfterMount: true,
            isLoadingError: false as const,
            isPaused: false,
            isPlaceholderData: false,
            isPreviousData: false,
            isRefetchError: false as const,
            isRefetching: false,
            remove: jest.fn(),
            refetch: jest.fn(),
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue(defaultMockValues.currentAccount)
        mockUseStoreActivations.mockReturnValue({
            storeActivations: defaultMockValues.storeActivations,
            progressPercentage: 50,
            isFetchLoading: false,
            isSaveLoading: false,
            changeSales: jest.fn(),
            changeSupport: jest.fn(),
            changeSupportChat: jest.fn(),
            changeSupportEmail: jest.fn(),
            saveStoreConfigurations: jest.fn(),
            migrateToNewPricing: jest.fn(),
            endTrial: jest.fn(),
            activation: jest.fn(),
        })
        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            defaultMockValues.shoppingAssistantTrialFlow,
        )
        mockUseTrialModalProps.mockReturnValue(
            defaultMockValues.trialModalProps,
        )
        mockUseUpgradePlan.mockReturnValue(defaultMockValues.upgradePlan)
        mockUseEarlyAccessAutomatePlan.mockReturnValue(
            defaultMockValues.earlyAccessPlan,
        )
    })

    describe('when no modals should be open', () => {
        it('should render nothing when no modal conditions are met', () => {
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            expect(
                screen.queryByText('Manage Shopping Assistant trial'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Upgrade Plan Modal'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Trial Opt Out Modal'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/Trial Ending Modal/),
            ).not.toBeInTheDocument()
        })
    })

    describe('when storeName is provided', () => {
        it('should render TrialEndingModal', () => {
            render(
                <TrialProgressModals
                    storeName="Test Store"
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.getByText('Trial Ending Modal for Test Store'),
            ).toBeInTheDocument()
        })
    })

    describe('when manage trial modal should be open', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockValues.shoppingAssistantTrialFlow,
                isManageTrialModalOpen: true,
            })
        })

        it('should render TrialManageModal with correct props', () => {
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            expect(
                screen.getByText('Manage Shopping Assistant trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('Opt Out')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Close' }),
            ).toBeInTheDocument()
        })

        describe('when early access plan is available', () => {
            beforeEach(() => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    ...defaultMockValues.earlyAccessPlan,
                    data: {
                        amount: 5,
                        amount_after_discount: 3,
                        discount: 2,
                        currency: 'USD',
                        cadence: Cadence.Month,
                        name: 'Test Plan',
                        plan_id: 'test',
                        product: 'automate' as any,
                        num_quota_tickets: 100,
                        custom: false,
                        extra_ticket_cost: 0,
                        price_id: 'test_price',
                        public: true,
                        features: {} as any,
                    },
                })
            })

            it('should show upgrade button', () => {
                render(
                    <TrialProgressModals
                        trialType={TrialType.ShoppingAssistant}
                    />,
                )

                expect(
                    screen.getByRole('button', { name: 'Upgrade Now' }),
                ).toBeInTheDocument()
            })

            it('should call upgradePlanAsync when upgrade button is clicked', async () => {
                const user = userEvent.setup()
                render(
                    <TrialProgressModals
                        trialType={TrialType.ShoppingAssistant}
                    />,
                )

                await act(async () => {
                    await user.click(
                        screen.getByRole('button', { name: 'Upgrade Now' }),
                    )
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.PricingModalClicked,
                    { type: 'upgraded' },
                )
                expect(
                    defaultMockValues.upgradePlan.upgradePlanAsync,
                ).toHaveBeenCalled()
                expect(
                    defaultMockValues.shoppingAssistantTrialFlow
                        .closeAllTrialModals,
                ).toHaveBeenCalled()
            })
        })

        describe('when early access plan is not available', () => {
            it('should not show upgrade button', () => {
                render(
                    <TrialProgressModals
                        trialType={TrialType.ShoppingAssistant}
                    />,
                )

                expect(
                    screen.queryByRole('button', { name: 'Upgrade Now' }),
                ).not.toBeInTheDocument()
            })
        })

        it('should call closeManageTrialModal when close button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Close' }))
            })

            expect(
                defaultMockValues.shoppingAssistantTrialFlow
                    .closeManageTrialModal,
            ).toHaveBeenCalled()
        })

        it('should open opt out modal when opt out button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Opt Out' }),
                )
            })

            expect(
                defaultMockValues.shoppingAssistantTrialFlow
                    .closeManageTrialModal,
            ).toHaveBeenCalled()
            expect(screen.getByText('Trial Opt Out Modal')).toBeInTheDocument()
        })
    })

    describe('when upgrade plan modal should be open', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockValues.shoppingAssistantTrialFlow,
                isUpgradePlanModalOpen: true,
            })
        })

        it('should render UpgradePlanModal', () => {
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            expect(screen.getByText('Upgrade Plan Modal')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Confirm Upgrade' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Dismiss' }),
            ).toBeInTheDocument()
        })

        it('should call closeUpgradePlanModal when close button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Close' }))
            })

            expect(
                defaultMockValues.shoppingAssistantTrialFlow
                    .closeUpgradePlanModal,
            ).toHaveBeenCalled()
        })

        it('should call closeUpgradePlanModal when dismiss button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Dismiss' }),
                )
            })

            expect(
                defaultMockValues.shoppingAssistantTrialFlow
                    .closeUpgradePlanModal,
            ).toHaveBeenCalled()
        })

        it('should handle upgrade confirmation with segment tracking', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Confirm Upgrade' }),
                )
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalClicked,
                { type: 'upgraded' },
            )
            expect(
                defaultMockValues.upgradePlan.upgradePlanAsync,
            ).toHaveBeenCalled()
        })

        it('should close modals after successful upgrade', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Confirm Upgrade' }),
                )
            })

            await waitFor(() => {
                expect(
                    defaultMockValues.shoppingAssistantTrialFlow
                        .closeAllTrialModals,
                ).toHaveBeenCalled()
            })
        })

        describe('when upgrade is loading', () => {
            beforeEach(() => {
                mockUseUpgradePlan.mockReturnValue({
                    ...defaultMockValues.upgradePlan,
                    isLoading: true,
                })
            })

            it('should show loading state on confirm button', () => {
                render(
                    <TrialProgressModals
                        trialType={TrialType.ShoppingAssistant}
                    />,
                )

                const confirmButton = screen.getByRole('button', {
                    name: 'Loading...',
                })
                expect(confirmButton).toBeInTheDocument()
                expect(confirmButton).toBeDisabled()
            })
        })
    })

    describe('when opt out modal is open', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockValues.shoppingAssistantTrialFlow,
                isManageTrialModalOpen: true,
            })
        })

        it('should render opt out modal after clicking opt out', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Opt Out' }),
                )
            })

            expect(screen.getByText('Trial Opt Out Modal')).toBeInTheDocument()
        })

        it('should call onRequestTrialExtension when request extension button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Opt Out' }),
                )
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: 'Request Extension' }),
                )
            })

            expect(
                defaultMockValues.shoppingAssistantTrialFlow
                    .onRequestTrialExtension,
            ).toHaveBeenCalled()
        })
    })

    describe('when storeName prop is provided', () => {
        it('should pass storeName to useTrialModalProps hook', () => {
            render(
                <TrialProgressModals
                    trialType={TrialType.ShoppingAssistant}
                    storeName="My Store"
                />,
            )

            expect(mockUseTrialModalProps).toHaveBeenCalledWith({
                storeName: 'My Store',
            })
        })

        it('should render TrialEndingModal with storeName', () => {
            render(
                <TrialProgressModals
                    trialType={TrialType.ShoppingAssistant}
                    storeName="My Store"
                />,
            )

            expect(
                screen.getByText('Trial Ending Modal for My Store'),
            ).toBeInTheDocument()
        })
    })

    describe('when useShoppingAssistantTrialFlow is called', () => {
        it('should be called with correct parameters', () => {
            render(
                <TrialProgressModals trialType={TrialType.ShoppingAssistant} />,
            )

            expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith({
                accountDomain: 'test-domain.com',
                storeActivations: {},
                trialType: TrialType.ShoppingAssistant,
            })
        })
    })
})
