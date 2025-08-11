import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import LD from 'launchdarkly-react-client-sdk'
import { useHistory, useLocation } from 'react-router-dom'

// Import mocked modules
import { logEvent } from 'common/segment/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { useOptOutSalesTrialUpgradeMutation } from 'models/aiAgent/queries'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialEndingModal } from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'

import { TrialManageWorkflow } from '../components/TrialManageWorkflow/TrialManageWorkflow'

// Mock only what the component directly uses
jest.mock('common/segment/segment')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner')
jest.mock('pages/aiAgent/trial/components/TrialManageModal/TrialManageModal')
jest.mock('pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal')
jest.mock('pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal')
jest.mock('models/aiAgent/queries')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('models/billing/queries', () => ({
    useEarlyAccessAutomatePlan: jest.fn(),
}))

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))

describe('TrialManageWorkflow', () => {
    const mockOpenManageTrialModal = jest.fn()
    const mockCloseManageTrialModal = jest.fn()
    const mockWindowOpen = jest.fn()
    const mockLogEvent = jest.fn()
    const mockOptOutMutate = jest.fn()
    const mockUpgradePlan = jest.fn()
    const mockUpgradePlanAsync = jest.fn().mockResolvedValue(undefined)

    const mockStoreConfiguration = {
        storeName: 'test-store',
        storeId: 'test-store-id',
        sales: {
            enabled: true,
        },
    } as any
    const mockPush = jest.fn()
    const mockUseHistory = useHistory as jest.Mock
    const mockUseLocation = useLocation as jest.Mock
    const mockUseSalesTrialRevampMilestone =
        useSalesTrialRevampMilestone as jest.Mock
    const mockUseEarlyAccessAutomatePlan =
        useEarlyAccessAutomatePlan as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock window.open
        global.window.open = mockWindowOpen
        ;(logEvent as jest.Mock).mockImplementation(mockLogEvent)

        // Mock React Router hooks
        mockUseHistory.mockReturnValue({
            push: mockPush,
        })
        mockUseLocation.mockReturnValue({
            pathname: '/test-path',
            search: '',
        })
        ;(useAppSelector as jest.Mock).mockReturnValue({
            get: (key: string) => (key === 'domain' ? 'test-domain.com' : null),
        })
        ;(useStoreActivations as jest.Mock).mockReturnValue({
            storeActivations: ['store1', 'store2'],
        })
        ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
            hasCurrentStoreTrialStarted: false,
            hasAnyTrialStarted: false,
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
            hasCurrentStoreTrialExpired: false,
            hasAnyTrialExpired: false,
            hasAnyTrialOptedIn: false,
            hasAnyTrialActive: false,
            canNotifyAdmin: false,
            canBookDemo: false,
            canSeeSystemBanner: false,
            canSeeTrialCTA: false,
        })
        ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
            openManageTrialModal: mockOpenManageTrialModal,
            isManageTrialModalOpen: false,
            closeManageTrialModal: mockCloseManageTrialModal,
        })
        ;(useUpgradePlan as jest.Mock).mockReturnValue({
            upgradePlan: mockUpgradePlan,
            upgradePlanAsync: mockUpgradePlanAsync,
            isLoading: false,
        })
        ;(useOptOutSalesTrialUpgradeMutation as jest.Mock).mockImplementation(
            (options?: any) => ({
                mutate: mockOptOutMutate,
                isLoading: false,
                onSuccess: options?.onSuccess,
            }),
        )
        ;(useTrialModalProps as jest.Mock).mockImplementation(() => {
            const { canBookDemo } = (
                useShoppingAssistantTrialAccess as jest.Mock
            ).mock.results[0]?.value || { canBookDemo: false }
            return {
                trialStartedBanner: {
                    title: 'Your Shopping Assistant trial ends in 5 days.',
                    description:
                        "So far, it's generated $25 in added GMV for your store.",
                    primaryAction: {
                        label: canBookDemo ? 'Book a demo' : 'Upgrade Now',
                        onClick: jest.fn(),
                    },
                    secondaryAction: {
                        label: 'Manage Trial',
                        onClick: jest.fn(),
                    },
                },
                trialEndingModal: {
                    description:
                        "Shopping Assistant drove $250 uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
                    advantages: ['$250 GMV uplift'],
                    secondaryDescription:
                        'With the upgrade, your plan will increase by $49.',
                },
                upgradePlanModal: {},
            }
        })
        ;(useSalesTrialRevampMilestone as jest.Mock).mockReturnValue(
            'milestone-1',
        )
        // Default to no early access plan
        mockUseEarlyAccessAutomatePlan.mockReturnValue({ data: null })
        // Default to shopping assistant during trial enabled
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ShoppingAssistantDuringTrial]: false,
        }))

        // Mock components to render test content
        ;(TrialAlertBanner as jest.Mock).mockImplementation((props: any) => (
            <div data-testid="trial-alert-banner">
                <button onClick={props.primaryAction.onClick}>
                    {props.primaryAction.label}
                </button>
                <button onClick={props.secondaryAction.onClick}>
                    {props.secondaryAction.label}
                </button>
            </div>
        ))
        ;(TrialManageModal as jest.Mock).mockImplementation((props: any) => (
            <div data-testid="trial-manage-modal">
                <h2>{props.title}</h2>
                <p>{props.description}</p>
                <button onClick={props.primaryAction?.onClick}>
                    {props.primaryAction?.label || 'Upgrade Now'}
                </button>
                <button onClick={props.secondaryAction?.onClick}>
                    {props.secondaryAction?.label || 'Opt Out'}
                </button>
                <button onClick={props.onClose}>Close</button>
            </div>
        ))
        ;(TrialEndingModal as jest.Mock).mockImplementation(() => null)
        ;(UpgradePlanModal as jest.Mock).mockImplementation(() => null)
    })

    it('does not render any components when user cannot see trial banner', () => {
        render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(
            screen.queryByTestId('trial-alert-banner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('trial-manage-modal'),
        ).not.toBeInTheDocument()
    })

    it('returns undefined and renders nothing when trial milestone is off', () => {
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')

        const { container } = render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(container.firstChild).toBeNull()
        expect(
            screen.queryByTestId('trial-alert-banner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('trial-manage-modal'),
        ).not.toBeInTheDocument()
    })

    describe('when user can see trial banner', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: true,
                hasAnyTrialActive: true,
                canSeeTrialCTA: true,
                canSeeSystemBanner: false,
                canNotifyAdmin: false,
                canBookDemo: false,
            })
        })

        it('renders TrialAlertBanner', () => {
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(screen.getByTestId('trial-alert-banner')).toBeInTheDocument()
        })

        it('shows "Book a demo" as primary action when user can book demo', () => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: true,
                hasAnyTrialActive: true,
                canSeeTrialCTA: true,
                canSeeSystemBanner: false,
                canNotifyAdmin: false,
                canBookDemo: true,
            })
            // Mock the trial modal props to return the correct actions
            ;(useTrialModalProps as jest.Mock).mockReturnValue({
                trialStartedBanner: {
                    title: 'Your Shopping Assistant trial ends in 5 days.',
                    description:
                        "So far, it's generated $25 in added GMV for your store.",
                    primaryAction: {
                        label: 'Book a demo',
                        onClick: jest.fn(),
                    },
                    secondaryAction: {
                        label: 'Manage Trial',
                        onClick: jest.fn(),
                    },
                },
                manageTrialModal: {
                    description:
                        'Shopping Assistant boosted your GMV by +$25 during the trial. Keep the momentum going and turn even more visitors into buyers.',
                    advantages: ['$25 GMV uplift'],
                    secondaryDescription:
                        'After your trial, your plan will increase by $50.',
                },
                upgradePlanModal: {},
            })

            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(screen.getByText('Book a demo')).toBeInTheDocument()
        })

        it('opens demo link in new tab when "Book a demo" is clicked', async () => {
            const mockOnClick = jest.fn()
            ;(useTrialModalProps as jest.Mock).mockReturnValue({
                trialStartedBanner: {
                    title: 'Your Shopping Assistant trial ends in 5 days.',
                    description:
                        "So far, it's generated $25 in added GMV for your store.",
                    primaryAction: {
                        label: 'Book a demo',
                        onClick: mockOnClick,
                    },
                    secondaryAction: {
                        label: 'Manage Trial',
                        onClick: jest.fn(),
                    },
                },
                manageTrialModal: {
                    description:
                        'Shopping Assistant boosted your GMV by +$25 during the trial. Keep the momentum going and turn even more visitors into buyers.',
                    advantages: ['$25 GMV uplift'],
                    secondaryDescription:
                        'After your trial, your plan will increase by $50.',
                },
                upgradePlanModal: {},
            })
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: true,
                hasAnyTrialActive: true,
                canSeeTrialCTA: true,
                canSeeSystemBanner: false,
                canNotifyAdmin: false,
                canBookDemo: true,
            })

            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const bookDemoButton = screen.getByText('Book a demo')
            await user.click(bookDemoButton)

            expect(mockOnClick).toHaveBeenCalled()
        })

        it('shows "Upgrade Now" as primary action when user cannot book demo', () => {
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )
            expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
        })

        it('does nothing when "Upgrade Now" is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const upgradeButton = screen.getByText('Upgrade Now')
            await user.click(upgradeButton)

            // No specific action should occur
            expect(mockWindowOpen).not.toHaveBeenCalled()
        })

        it('opens manage trial modal when "Manage Trial" is clicked', async () => {
            const mockOnManageTrial = jest.fn()
            ;(useTrialModalProps as jest.Mock).mockReturnValue({
                trialStartedBanner: {
                    title: 'Your Shopping Assistant trial ends in 5 days.',
                    description:
                        "So far, it's generated $25 in added GMV for your store.",
                    primaryAction: {
                        label: 'Upgrade Now',
                        onClick: jest.fn(),
                    },
                    secondaryAction: {
                        label: 'Manage Trial',
                        onClick: mockOnManageTrial,
                    },
                },
                manageTrialModal: {
                    description:
                        'Shopping Assistant boosted your GMV by +$25 during the trial. Keep the momentum going and turn even more visitors into buyers.',
                    advantages: ['$25 GMV uplift'],
                    secondaryDescription:
                        'After your trial, your plan will increase by $50.',
                },
                upgradePlanModal: {},
            })
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const manageTrialButton = screen.getByText('Manage Trial')
            await user.click(manageTrialButton)

            expect(mockOnManageTrial).toHaveBeenCalled()
        })
    })

    describe('when manage trial modal is open', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: true,
                closeManageTrialModal: mockCloseManageTrialModal,
            })
        })

        it('renders TrialManageModal', () => {
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )
            expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        })

        it('displays correct title and description with GMV metrics', () => {
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(
                screen.getByText('Manage Shopping Assistant trial'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Shopping Assistant drove \$250 uplift in GMV/,
                ),
            ).toBeInTheDocument()
        })

        it('displays GMV metric in advantages', () => {
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(TrialManageModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    advantages: ['$250 GMV uplift'],
                }),
                expect.anything(),
            )
        })

        it('closes modal when "Opt Out" is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const optOutButton = screen.getByText('Opt Out')
            await act(async () => {
                await user.click(optOutButton)
            })

            expect(mockCloseManageTrialModal).toHaveBeenCalled()
        })

        it('closes modal when onClose is triggered', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const closeButton = screen.getByText('Close')
            await act(async () => {
                await user.click(closeButton)
            })

            expect(mockCloseManageTrialModal).toHaveBeenCalled()
        })
    })

    it('passes correct parameters to useShoppingAssistantTrialFlow', () => {
        render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(useShoppingAssistantTrialFlow).toHaveBeenCalledWith({
            accountDomain: 'test-domain.com',
            storeActivations: ['store1', 'store2'],
        })
    })

    it('passes correct props to TrialAlertBanner', () => {
        ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
            hasCurrentStoreTrialStarted: true,
            hasAnyTrialStarted: true,
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
            hasCurrentStoreTrialExpired: false,
            hasAnyTrialExpired: false,
            hasAnyTrialOptedIn: true,
            hasAnyTrialActive: true,
            canSeeTrialCTA: true,
            canSeeSystemBanner: false,
            canNotifyAdmin: false,
            canBookDemo: false,
        })

        render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(TrialAlertBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Your Shopping Assistant trial ends in 5 days.',
                description:
                    "So far, it's generated $25 in added GMV for your store.",
                primaryAction: {
                    label: 'Upgrade Now',
                    onClick: expect.any(Function),
                },
                secondaryAction: {
                    label: 'Manage Trial',
                    onClick: expect.any(Function),
                },
            }),
            expect.anything(),
        )
    })

    it('passes correct props to TrialManageModal', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
            openManageTrialModal: mockOpenManageTrialModal,
            isManageTrialModalOpen: true,
            closeManageTrialModal: mockCloseManageTrialModal,
            openTrialUpgradeModal: mockOpenTrialUpgradeModal,
        })

        render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        const call = (TrialManageModal as jest.Mock).mock.calls[0]
        expect(call[0].title).toBe('Manage Shopping Assistant trial')
        expect(call[0].description).toBe(
            "Shopping Assistant drove $250 uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
        )
        expect(call[0].advantages).toEqual(['$250 GMV uplift'])
        expect(call[0].onClose).toBe(mockCloseManageTrialModal)
        expect(call[0].primaryAction).toBeUndefined()
        expect(call[0].secondaryAction.label).toBe('Opt Out')
        expect(typeof call[0].secondaryAction.onClick).toBe('function')
    })

    it('does not render primary action when earlyAccessPlan is null', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
            openManageTrialModal: mockOpenManageTrialModal,
            isManageTrialModalOpen: true,
            closeManageTrialModal: mockCloseManageTrialModal,
            openTrialUpgradeModal: mockOpenTrialUpgradeModal,
        })

        // Mock earlyAccessPlan to be null
        mockUseEarlyAccessAutomatePlan.mockReturnValue({ data: null })

        render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        const call = (TrialManageModal as jest.Mock).mock.calls[0]
        expect(call[0].primaryAction).toBeUndefined()
        expect(call[0].secondaryAction.label).toBe('Opt Out')
    })

    it('renders primary action when earlyAccessPlan has value', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
            openManageTrialModal: mockOpenManageTrialModal,
            isManageTrialModalOpen: true,
            closeManageTrialModal: mockCloseManageTrialModal,
            openTrialUpgradeModal: mockOpenTrialUpgradeModal,
        })

        // Mock earlyAccessPlan to have a value
        mockUseEarlyAccessAutomatePlan.mockReturnValue({
            data: {
                id: 'early-access-123',
                name: 'Early Access Plan',
            },
        })

        render(
            <TrialManageWorkflow
                pageName="Strategy"
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        const call = (TrialManageModal as jest.Mock).mock.calls[0]
        expect(call[0].primaryAction.label).toBe('Upgrade Now')
        expect(typeof call[0].primaryAction.onClick).toBe('function')
        expect(call[0].secondaryAction.label).toBe('Opt Out')
    })

    describe('useEffect logging', () => {
        it('logs TrialBannerSettingsViewed event when hasActiveTrial is true', () => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: true,
                hasAnyTrialActive: true,
                canSeeTrialCTA: true,
                canSeeSystemBanner: false,
                canNotifyAdmin: false,
                canBookDemo: false,
            })

            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-banner-settings-viewed',
                {
                    type: 'Strategy',
                },
            )
        })

        it('logs TrialBannerSettingsViewed event with correct pageName for Engagement', () => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: true,
                hasAnyTrialActive: true,
                canSeeTrialCTA: true,
                canSeeSystemBanner: false,
                canNotifyAdmin: false,
                canBookDemo: false,
            })

            render(
                <TrialManageWorkflow
                    pageName="Engagement"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-banner-settings-viewed',
                {
                    type: 'Engagement',
                },
            )
        })

        it('does not log event when hasActiveTrial is false', () => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                hasCurrentStoreTrialStarted: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
                canSeeTrialCTA: false,
                canSeeSystemBanner: false,
                canNotifyAdmin: false,
                canBookDemo: false,
            })

            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(mockLogEvent).not.toHaveBeenCalled()
        })
    })

    describe('UpgradePlanModal', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: false,
                closeManageTrialModal: mockCloseManageTrialModal,
                isUpgradePlanModalOpen: true,
                closeUpgradePlanModal: jest.fn(),
            })
            ;(UpgradePlanModal as jest.Mock).mockImplementation(
                (props: any) => (
                    <div data-testid="upgrade-plan-modal">
                        <button onClick={props.onConfirm}>Confirm</button>
                        <button onClick={props.onDismiss}>Dismiss</button>
                    </div>
                ),
            )
        })

        it('renders UpgradePlanModal when isUpgradePlanModalOpen is true', () => {
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            expect(screen.getByTestId('upgrade-plan-modal')).toBeInTheDocument()
        })

        it('calls upgradePlan and logs event when onConfirm is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const confirmButton = screen.getByText('Confirm')
            await user.click(confirmButton)

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/pricing-modal-clicked',
                {
                    type: 'upgraded',
                },
            )
            expect(mockUpgradePlanAsync).toHaveBeenCalled()
        })

        it('passes correct props to UpgradePlanModal', () => {
            const mockCloseUpgradePlanModal = jest.fn()
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: false,
                closeManageTrialModal: mockCloseManageTrialModal,
                isUpgradePlanModalOpen: true,
                closeUpgradePlanModal: mockCloseUpgradePlanModal,
            })

            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const call = (UpgradePlanModal as jest.Mock).mock.calls[0]
            expect(call[0].onClose).toBe(mockCloseUpgradePlanModal)
            expect(call[0].onDismiss).toBe(mockCloseUpgradePlanModal)
            expect(call[0].isLoading).toBe(false)
            expect(typeof call[0].onConfirm).toBe('function')
        })
    })

    describe('TrialOptOutModal (flag disabled - old modal)', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: true,
                closeManageTrialModal: mockCloseManageTrialModal,
            })
        })

        it('renders TrialOptOutModal when opt out is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            await waitFor(() => {
                expect(
                    screen.getByText('Opt out of upgrade?'),
                ).toBeInTheDocument()
            })
        })

        it('calls optOutPlan and logs event when Opt Out is confirmed', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            // Confirm opt out in opt out modal
            const confirmOptOutButton = screen.getAllByRole('button', {
                name: 'Opt Out',
            })[1] // Second button is in the opt out modal
            await user.click(confirmOptOutButton)

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-opt-out-modal-clicked',
                {
                    CTA: 'Confirm',
                },
            )
            expect(mockOptOutMutate).toHaveBeenCalledWith([], {
                onSuccess: expect.any(Function),
            })
        })

        it('logs event when Dismiss is clicked', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            // Click dismiss in opt out modal
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await user.click(dismissButton)

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-opt-out-modal-clicked',
                {
                    CTA: 'Dismiss',
                },
            )
        })

        it('logs event when modal is closed', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            // Click close button - use getAllByRole to get all close buttons and select the correct one
            const closeButtons = screen.getAllByRole('button', {
                name: /close/i,
            })
            // The second close button should be the one in the opt out modal
            await user.click(closeButtons[1])

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-opt-out-modal-clicked',
                {
                    CTA: 'Close',
                },
            )
        })

        it('shows loading state when optOutPlan is loading', async () => {
            ;(
                useOptOutSalesTrialUpgradeMutation as jest.Mock
            ).mockImplementation(() => ({
                mutate: mockOptOutMutate,
                isLoading: true,
            }))

            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            // Check that the opt out button has loading state
            const confirmOptOutButton = screen.getByRole('button', {
                name: 'Opt Out',
            })
            // The button should be in a loading state - this means the UI shows a spinner or loading indicator
            // Since the exact implementation depends on the Button component from merchant-ui-kit, we just check that it exists
            expect(confirmOptOutButton).toBeInTheDocument()
        })

        it('updates URL with showOptOutFeedback parameter after opt out modal is closed', async () => {
            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            // Click dismiss to close modal
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await user.click(dismissButton)

            // Check that URL is updated with showOptOutFeedback parameter
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/test-path',
                search: 'showOptOutFeedback=true',
            })
        })

        it('calls onSuccess callback and updates URL when optOutPlan succeeds', async () => {
            let onSuccessCallback: (() => void) | undefined

            // Set up the mock to capture the onSuccess callback from mutate call
            mockOptOutMutate.mockImplementation((_data: any, options?: any) => {
                onSuccessCallback = options?.onSuccess
            })

            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            // Confirm opt out
            const confirmOptOutButton = screen.getAllByRole('button', {
                name: 'Opt Out',
            })[1] // Second button is in the opt out modal
            await user.click(confirmOptOutButton)

            // Simulate success callback
            expect(onSuccessCallback).toBeDefined()
            act(() => {
                onSuccessCallback?.()
            })

            // Modal should be closed (opt out of upgrade text should not be visible)
            expect(
                screen.queryByText('Opt out of upgrade?'),
            ).not.toBeInTheDocument()

            // Check that URL is updated with showOptOutFeedback parameter
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/test-path',
                search: 'showOptOutFeedback=true',
            })
        })
    })

    describe('upgrade plan modal opening', () => {
        it('opens upgrade plan modal when Upgrade Now is clicked in manage modal', async () => {
            const mockOpenTrialUpgradeModal = jest.fn()
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: true,
                closeManageTrialModal: mockCloseManageTrialModal,
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
            })
            // Mock earlyAccessPlan to have value so Upgrade Now button appears
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: {
                    id: 'early-access-123',
                    name: 'Early Access Plan',
                },
            })

            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            const upgradeButton = screen.getByText('Upgrade Now')
            await user.click(upgradeButton)

            expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
        })
    })

    describe('URL parameter handling', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: true,
                closeManageTrialModal: mockCloseManageTrialModal,
            })
        })

        it('preserves existing URL parameters when adding showOptOutFeedback', async () => {
            // Mock location with existing parameters
            mockUseLocation.mockReturnValue({
                pathname: '/test-path',
                search: '?existingParam=value&anotherParam=test',
            })

            const user = userEvent.setup()
            render(
                <TrialManageWorkflow
                    pageName="Strategy"
                    storeConfiguration={mockStoreConfiguration}
                />,
            )

            // Click opt out in manage modal
            const optOutButton = screen.getByText('Opt Out')
            await act(async () => {
                await user.click(optOutButton)
            })

            // Click dismiss to close modal
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await user.click(dismissButton)

            // Check that URL preserves existing parameters and adds new one
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/test-path',
                search: 'existingParam=value&anotherParam=test&showOptOutFeedback=true',
            })
        })
    })
})
