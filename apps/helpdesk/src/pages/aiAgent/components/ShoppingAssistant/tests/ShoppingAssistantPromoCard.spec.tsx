import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { useShoppingAssistantPromoCard } from '../hooks/useShoppingAssistantPromoCard'
import { ShoppingAssistantPromoCard } from '../ShoppingAssistantPromoCard'
import { PromoCardContent, PromoCardVariant } from '../types/ShoppingAssistant'

jest.mock('../hooks/useShoppingAssistantPromoCard')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('core/flags')
jest.mock('hooks/useAppSelector')
jest.mock('../components/TrialProgressModals', () => ({
    TrialProgressModals: jest.fn(() => (
        <div data-testid="trial-progress-modals" />
    )),
}))
jest.mock(
    'pages/aiAgent/trial/components/TrialEndedModal/TrialEndedModal',
    () => ({
        TrialEndedModal: () => <div data-testid="trial-ended-modal" />,
    }),
)

const mockUseShoppingAssistantPromoCard =
    useShoppingAssistantPromoCard as jest.MockedFunction<
        typeof useShoppingAssistantPromoCard
    >

const mockUseTrialModalProps = useTrialModalProps as jest.MockedFunction<
    typeof useTrialModalProps
>

const mockUseTrialEnding = useTrialEnding as jest.MockedFunction<
    typeof useTrialEnding
>

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

const mockStore = configureMockStore()
const queryClient = mockQueryClient()

const renderComponent = (props?: any) => {
    return render(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <ShoppingAssistantPromoCard {...props} />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('ShoppingAssistantPromoCard', () => {
    const mockOnClick = jest.fn()
    const mockVideoModalClick = jest.fn()
    const mockSecondaryClick = jest.fn()

    const basePromoContent: PromoCardContent = {
        variant: PromoCardVariant.AdminTrial,
        title: 'Unlock new AI Agent skills',
        description: 'Go beyond automation and grow revenue by 1.5%',
        shouldShowDescriptionIcon: false,
        showVideo: true,
        shouldShowNotificationIcon: false,
        primaryButton: {
            label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            onClick: mockOnClick,
        },
        secondaryButton: {
            label: 'Learn more',
            href: 'https://example.com/learn',
            onClick: mockSecondaryClick,
        },
        videoModalButton: {
            label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            onClick: mockVideoModalClick,
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        localStorage.clear()

        mockUseFlag.mockImplementation((flagKey: string) => {
            if (
                flagKey ===
                'linear.project_post-ga-shopping-assistant-trial-improvement.during_trial'
            ) {
                return true
            }
            return false
        })

        mockUseAppSelector.mockReturnValue([
            {
                meta: {
                    shop_name: 'test-shop',
                },
            },
        ])

        // Mock useTrialEnding to return values that make the modal show
        mockUseTrialEnding.mockReturnValue({
            remainingDays: 0,
            remainingDaysFloat: 0,
            trialEndDatetime: '2024-01-01T00:00:00.000Z',
            trialTerminationDatetime: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 2 days ago
            optedOutDatetime: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 2 days ago
        })

        // Mock useTrialModalProps with minimal required properties
        mockUseTrialModalProps.mockReturnValue({
            trialUpgradePlanModal: {
                title: 'Mock Trial Upgrade',
                currentPlan: { name: 'Mock Current Plan', amount: '$100' },
                newPlan: { name: 'Mock New Plan', amount: '$200' },
            },
            upgradePlanModal: {
                title: 'Mock Upgrade Plan',
                currentPlan: { name: 'Mock Current Plan', amount: '$100' },
                newPlan: { name: 'Mock New Plan', amount: '$200' },
            },
            trialActivatedModal: {
                title: 'Mock Trial Activated',
            },
            trialStartedBanner: {
                title: 'Mock Trial Started',
                description: 'Mock description',
                primaryAction: { label: 'Mock Primary', onClick: jest.fn() },
                secondaryAction: {
                    label: 'Mock Secondary',
                    onClick: jest.fn(),
                },
            },
            trialAlertBanner: {
                title: 'Mock Trial Alert',
                description: 'Mock description',
                primaryAction: { label: 'Mock Primary', onClick: jest.fn() },
                secondaryAction: {
                    label: 'Mock Secondary',
                    onClick: jest.fn(),
                },
            },
            manageTrialModal: {
                description: 'Mock manage trial description',
                advantages: [],
                secondaryDescription: 'Mock secondary description',
            },
            trialFinishSetupModal: {
                title: 'Mock Trial Finish Setup',
                subtitle: 'Mock subtitle',
                content: 'Mock content',
                primaryAction: { label: 'Mock Primary', onClick: jest.fn() },
            },
            newTrialUpgradePlanModal: {
                title: 'Mock New Trial Upgrade',
                subtitle: 'Mock subtitle',
                currentPlan: { name: 'Mock Current Plan', amount: '$100' },
                newPlan: { name: 'Mock New Plan', amount: '$200' },
                primaryAction: { label: 'Mock Primary', onClick: jest.fn() },
                secondaryAction: {
                    label: 'Mock Secondary',
                    onClick: jest.fn(),
                },
                onClose: jest.fn(),
            },
            trialEndedModal: {
                title: 'Mock Trial Ended',
                description: 'Mock trial ended description',
                advantages: ['Mock advantage 1', 'Mock advantage 2'],
                secondaryDescription: 'Mock secondary description',
            },
        } as any)
    })

    describe('Null rendering', () => {
        it('should return null when hook returns null', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: null,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })
    })

    describe('Admin Trial Progress variant', () => {
        const adminTrialProgressContent: PromoCardContent = {
            variant: PromoCardVariant.AdminTrialProgress,
            title: 'Shopping Assistant Trial',
            description: '$1250 GMV influenced',
            shouldShowDescriptionIcon: true,
            showVideo: false,
            shouldShowNotificationIcon: false,
            primaryButton: {
                label: 'Upgrade now',
                onClick: mockOnClick,
            },
            secondaryButton: {
                label: 'Manage Trial',
                onClick: mockSecondaryClick,
            },
            videoModalButton: undefined,
            showProgressBar: true,
            progressPercentage: 100,
            progressText: '14 days left',
        }

        it('should render trial progress content with progress bar', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('14 days left')).toBeInTheDocument()
        })

        it('should render as collapsible card when in trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            // Check for collapsible button which indicates it's a collapsible card
            const collapseButton = screen.getByLabelText('Collapse')
            expect(collapseButton).toBeInTheDocument()
        })

        it('should render upgrade and manage trial buttons', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByRole('button', { name: /upgrade now/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /manage trial/i }),
            ).toBeInTheDocument()
        })

        it('should not render video content during trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.queryByAltText('Shopping Assistant Demo'),
            ).not.toBeInTheDocument()
        })

        it('should return null when feature flag is disabled', () => {
            mockUseFlag.mockImplementation(() => false)
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('should render AdminTrialProgress component with correct structure', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('14 days left')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /upgrade now/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Lead Trial Progress variant', () => {
        const leadTrialProgressContent: PromoCardContent = {
            variant: PromoCardVariant.LeadTrialProgress,
            title: 'Shopping Assistant Trial',
            description: '$1250 GMV influenced',
            shouldShowDescriptionIcon: true,
            showVideo: false,
            shouldShowNotificationIcon: false,
            primaryButton: {
                label: '',
                disabled: true,
            },
            secondaryButton: undefined,
            videoModalButton: undefined,
            showProgressBar: true,
            progressPercentage: 100,
            progressText: '14 days left',
        }

        it('should render trial progress content with progress bar but no CTAs', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('14 days left')).toBeInTheDocument()
        })

        it('should render as collapsible card when in trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            // Check for collapsible button which indicates it's a collapsible card
            const collapseButton = screen.getByLabelText('Collapse')
            expect(collapseButton).toBeInTheDocument()
        })

        it('should not render any action buttons for lead users when no CTA available', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            // Should not render primary/secondary buttons (excluding collapsible button)
            expect(
                screen.queryByRole('button', { name: /upgrade now/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /manage trial/i }),
            ).not.toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('should not render video content during trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.queryByAltText('Shopping Assistant Demo'),
            ).not.toBeInTheDocument()
        })

        it('should return null when feature flag is disabled', () => {
            mockUseFlag.mockImplementation(() => false)
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('should render LeadTrialProgress component with correct structure', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('14 days left')).toBeInTheDocument()
        })
    })

    describe('Switch statement coverage', () => {
        it('should render AdminTrial component for AdminTrial variant', () => {
            const adminTrialContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.AdminTrial,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByText('Unlock new AI Agent skills'),
            ).toBeInTheDocument()
        })

        it('should render AdminDemo component for AdminDemo variant', () => {
            const adminDemoContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.AdminDemo,
                primaryButton: {
                    label: 'Book a demo',
                    href: 'https://example.com/demo',
                },
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminDemoContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByRole('link', { name: /book a demo/i }),
            ).toBeInTheDocument()
        })

        it('should render LeadNotify component for LeadNotify variant', () => {
            const leadNotifyContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.LeadNotify,
                primaryButton: {
                    label: 'Notify admin',
                    onClick: mockOnClick,
                },
                shouldShowNotificationIcon: true,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadNotifyContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(
                screen.getByRole('button', { name: /notify admin/i }),
            ).toBeInTheDocument()
        })

        it('should return shared content for Hidden variant', () => {
            const hiddenContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.Hidden,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: hiddenContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(screen.getByTestId('trial-ended-modal')).toBeInTheDocument()
        })

        it('should return shared content for unknown variant', () => {
            const unknownContent: PromoCardContent = {
                ...basePromoContent,
                variant: 'unknown-variant' as PromoCardVariant,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: unknownContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent()

            expect(screen.getByTestId('trial-ended-modal')).toBeInTheDocument()
        })
    })

    describe('Props passing', () => {
        it('should pass className prop to child components', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: basePromoContent,
                trialFlow: {
                    isTrialModalOpen: false,
                } as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent({ className: 'test-class' })

            // Verify className is passed to the rendered component
            const promoCard = screen
                .getByText('Unlock new AI Agent skills')
                .closest('[class*="test-class"]')
            expect(promoCard).toBeInTheDocument()
        })

        it('should pass promoContent prop to AdminTrialProgress component', () => {
            const adminTrialProgressContent: PromoCardContent = {
                variant: PromoCardVariant.AdminTrialProgress,
                title: 'Shopping Assistant Trial',
                description: '$1250 GMV influenced',
                shouldShowDescriptionIcon: true,
                showVideo: false,
                shouldShowNotificationIcon: false,
                primaryButton: {
                    label: 'Upgrade now',
                    onClick: mockOnClick,
                },
                showProgressBar: true,
                progressPercentage: 75,
                progressText: '5 days left',
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: adminTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent({ className: 'admin-trial-progress' })

            // Verify all content from promoContent is rendered
            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('5 days left')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /upgrade now/i }),
            ).toBeInTheDocument()
        })

        it('should pass promoContent prop to LeadTrialProgress component', () => {
            const leadTrialProgressContent: PromoCardContent = {
                variant: PromoCardVariant.LeadTrialProgress,
                title: 'Shopping Assistant Trial',
                description: '$2500 GMV influenced',
                shouldShowDescriptionIcon: true,
                showVideo: false,
                shouldShowNotificationIcon: false,
                primaryButton: {
                    label: '',
                    disabled: true,
                },
                showProgressBar: true,
                progressPercentage: 40,
                progressText: '8 days left',
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue({
                promoCardContent: leadTrialProgressContent,
                trialFlow: {} as UseShoppingAssistantTrialFlowReturn,
            })
            renderComponent({ className: 'lead-trial-progress' })

            // Verify all content from promoContent is rendered
            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$2500 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('8 days left')).toBeInTheDocument()
        })
    })
})
