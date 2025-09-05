import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useHistory, useLocation } from 'react-router-dom'

// Import mocked modules
import { logEvent } from 'common/segment/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useOptOutSalesTrialUpgradeMutation } from 'models/aiAgent/queries'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialEndingModal } from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
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
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
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
        ;(useTrialAccess as jest.Mock).mockReturnValue({
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
            const { canBookDemo } = (useTrialAccess as jest.Mock).mock
                .results[0]?.value || { canBookDemo: false }
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
            ;(useTrialAccess as jest.Mock).mockReturnValue({
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
            ;(useTrialAccess as jest.Mock).mockReturnValue({
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
            ;(useTrialAccess as jest.Mock).mockReturnValue({
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

    it('passes correct props to TrialAlertBanner', () => {
        ;(useTrialAccess as jest.Mock).mockReturnValue({
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

    describe('useEffect logging', () => {
        it('logs TrialBannerSettingsViewed event when hasActiveTrial is true', () => {
            ;(useTrialAccess as jest.Mock).mockReturnValue({
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
                trialType: 'shoppingAssistant',
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
                    trialType: 'shoppingAssistant',
                },
            )
        })

        it('logs TrialBannerSettingsViewed event with correct pageName for Engagement', () => {
            ;(useTrialAccess as jest.Mock).mockReturnValue({
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
                trialType: 'shoppingAssistant',
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
                    trialType: 'shoppingAssistant',
                },
            )
        })

        it('does not log event when hasActiveTrial is false', () => {
            ;(useTrialAccess as jest.Mock).mockReturnValue({
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
})
