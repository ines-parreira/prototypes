import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import type { Trial } from 'models/aiAgent/types'
import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import type { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

import type { TrialFeature } from '../TrialTryModal'
import TrialTryModal from '../TrialTryModal'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgent/queries')
jest.mock('hooks/aiAgent/useAiAgentUpgradePlan')

const mockCurrentPlan = {
    name: 'Basic',
    price: '$50',
    billingPeriod: Cadence.Month,
    priceTooltipText: `Billed ${getCadenceName(Cadence.Month)} at $50 per seat`,
} as unknown as PlanDetails

const mockNewPlan = {
    name: 'Pro',
    price: '$100',
    billingPeriod: Cadence.Month,
    priceTooltipText: `Billed ${getCadenceName(Cadence.Month)} at $100 per seat`,
} as unknown as PlanDetails

const mockFeatures: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. All features are unlocked.',
    },
    {
        icon: 'notifications_none',
        title: 'Day 7',
        description: "We'll remind you when you're halfway through your trial.",
    },
    {
        icon: 'star_outline',
        title: 'Day 14',
        description: 'Your new plan kicks in automatically after the trial.',
    },
]

const mockStore = configureStore({
    reducer: {
        currentAccount: () => ({
            domain: 'test-domain',
        }),
    },
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
})

const defaultProps = {
    title: 'Unlock new AI Agent skills',
    subtitle: 'Try all Pro features for 14 days with no commitment.',
    isOpen: true,
    onClose: jest.fn(),
    primaryAction: {
        label: 'Start trial now',
        onClick: jest.fn(),
    },
    secondaryAction: {
        label: 'No, thanks',
        onClick: jest.fn(),
    },
    showTermsCheckbox: true,
    isLoading: false,
    currentPlan: mockCurrentPlan,
    newPlan: mockNewPlan,
    features: mockFeatures,
}

const mockUseAppSelector = jest.requireMock('hooks/useAppSelector').default
const mockUseGetTrials = jest.requireMock('models/aiAgent/queries').useGetTrials
const mockUseAiAgentUpgradePlan = jest.requireMock(
    'hooks/aiAgent/useAiAgentUpgradePlan',
).useAiAgentUpgradePlan

const mockCurrentAccount = {
    get: jest.fn().mockImplementation((key: string) => {
        if (key === 'domain') return 'test-domain'
        return null
    }),
}

const createMockTrial = (
    optedIn: boolean,
    expired: boolean = false,
): Trial => ({
    shopType: 'shopify',
    shopName: 'Test Shop',
    type: TrialType.AiAgent,
    trial: optedIn
        ? {
              startDatetime: '2024-01-01T00:00:00Z',
              endDatetime: '2024-01-15T00:00:00Z',
              account: {
                  optInDatetime: '2024-01-01T00:00:00Z',
                  optOutDatetime: null,
                  plannedUpgradeDatetime: null,
                  actualUpgradeDatetime: null,
                  actualTerminationDatetime: expired
                      ? '2024-01-14T00:00:00Z'
                      : null,
              },
          }
        : {
              startDatetime: null,
              endDatetime: null,
              account: {
                  optInDatetime: null,
                  optOutDatetime: null,
                  plannedUpgradeDatetime: null,
                  actualUpgradeDatetime: null,
                  actualTerminationDatetime: null,
              },
          },
})

const renderWithProviders = (props = {}) => {
    return render(
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                <TrialTryModal {...defaultProps} {...props} />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('<TrialTryModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue(mockCurrentAccount)
        mockUseGetTrials.mockReturnValue({
            data: [],
            isLoading: false,
        })
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: null,
            isLoading: false,
        })
    })

    it('renders the modal when isOpen is true', () => {
        renderWithProviders()

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        renderWithProviders({ isOpen: false })

        expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })

    it('displays current and new plan pricing information when upgrade plan is available', () => {
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        expect(screen.getByText('Current plan')).toBeInTheDocument()
        expect(
            screen.getByText(
                `${mockCurrentPlan.price} / ${mockCurrentPlan.billingPeriod}`,
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('After trial ends')).toBeInTheDocument()
        expect(
            screen.getByText(
                `${mockNewPlan.price} / ${mockNewPlan.billingPeriod}`,
            ),
        ).toBeInTheDocument()
    })

    it('renders feature cards with timeline elements', () => {
        renderWithProviders()

        expect(screen.getByText('Today')).toBeInTheDocument()
        expect(screen.getByText('Day 7')).toBeInTheDocument()
        expect(screen.getByText('Day 14')).toBeInTheDocument()
    })

    it('renders terms checkbox when showTermsCheckbox is true and upgrade plan is available', () => {
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        expect(
            screen.getByText(/I agree to the updated pricing/),
        ).toBeInTheDocument()
        expect(screen.getByText('Gorgias terms')).toBeInTheDocument()
    })

    it('does not render terms checkbox when showTermsCheckbox is false', () => {
        renderWithProviders({ showTermsCheckbox: false })

        expect(
            screen.queryByText(/I agree to the updated pricing/),
        ).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked and upgrade plan is available', async () => {
        const user = userEvent.setup()
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const closeButton = screen.getByRole('button', {
            name: defaultProps.secondaryAction.label,
        })
        await user.click(closeButton)

        expect(defaultProps.secondaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('handles terms checkbox interaction when no existing trial', async () => {
        const user = userEvent.setup()
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })
        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)
        expect(checkbox).toBeChecked()
    })
    it('calls primaryAction.onClick when terms are accepted and primary button is clicked and upgrade plan is available', async () => {
        const user = userEvent.setup()
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('does not call primaryAction.onClick when terms are not accepted and upgrade plan is available', async () => {
        const user = userEvent.setup()
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).not.toHaveBeenCalled()
    })

    it('displays "Today" and "0" when currentPlan is null and upgrade plan is available', () => {
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders({ currentPlan: null })

        expect(screen.getAllByText('Today')).toHaveLength(2)
        expect(screen.getByText('$0')).toBeInTheDocument()
        expect(screen.getByText('After trial ends')).toBeInTheDocument()
        expect(
            screen.getByText(
                `${mockNewPlan.price} / ${mockNewPlan.billingPeriod}`,
            ),
        ).toBeInTheDocument()
    })

    it('pre-checks and disables terms checkbox when there is an active opted-in trial and upgrade plan is available', () => {
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(true, false)],
            isLoading: false,
        })
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
        expect(checkbox).toBeDisabled()
    })

    it('does not pre-check terms checkbox when trial has expired and upgrade plan is available', () => {
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(true, true)],
            isLoading: false,
        })
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
        expect(checkbox).not.toBeDisabled()
    })

    it('does not pre-check terms checkbox when trial is not opted-in and upgrade plan is available', () => {
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(false, false)],
            isLoading: false,
        })
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
        expect(checkbox).not.toBeDisabled()
    })

    it('calls primaryAction.onClick directly when terms are pre-checked due to existing trial and upgrade plan is available', async () => {
        const user = userEvent.setup()
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(true, false)],
            isLoading: false,
        })
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('does not render modal while trials are loading', () => {
        mockUseGetTrials.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        renderWithProviders()

        expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })

    describe('Upgrade Plan Conditional Rendering', () => {
        it('renders contact message and disabled primary button when no upgrade plan data', () => {
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: null,
                isLoading: false,
            })

            renderWithProviders()

            // Should show contact message
            expect(
                screen.getByText(
                    'Please get in touch with our team to start your free trial.',
                ),
            ).toBeInTheDocument()

            // Should not show pricing section
            expect(screen.queryByText('Current plan')).not.toBeInTheDocument()
            expect(
                screen.queryByText('After trial ends'),
            ).not.toBeInTheDocument()

            // Should not show terms checkbox
            expect(
                screen.queryByText(/I agree to the updated pricing/),
            ).not.toBeInTheDocument()

            // Primary button should be disabled
            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('renders contact message and disabled primary button when upgrade plan is loading', () => {
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: null,
                isLoading: true,
            })

            renderWithProviders()

            // Should show contact message
            expect(
                screen.getByText(
                    'Please get in touch with our team to start your free trial.',
                ),
            ).toBeInTheDocument()

            // Primary button should be disabled
            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('renders normal pricing section and enabled buttons when upgrade plan data exists', () => {
            const mockUpgradePlan = {
                id: 'pro-plan',
                name: 'Pro Plan',
                price: '$100',
                billingPeriod: 'month',
            }

            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: mockUpgradePlan,
                isLoading: false,
            })

            renderWithProviders()

            // Should show pricing section
            expect(screen.getByText('Current plan')).toBeInTheDocument()
            expect(screen.getByText('After trial ends')).toBeInTheDocument()

            // Should show terms checkbox
            expect(
                screen.getByText(/I agree to the updated pricing/),
            ).toBeInTheDocument()

            // Primary button should be enabled (not disabled by upgrade plan logic)
            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            expect(primaryButton).not.toHaveAttribute('aria-disabled', 'true')
        })

        it('does not call primary action when buttons are disabled due to no upgrade plan', async () => {
            const user = userEvent.setup()
            const mockOnClick = jest.fn()

            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: null,
                isLoading: false,
            })

            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    onClick: mockOnClick,
                },
            })

            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            await user.click(primaryButton)

            expect(mockOnClick).not.toHaveBeenCalled()
        })
    })

    it('handles multiple trials with mixed states correctly when upgrade plan is available', () => {
        mockUseGetTrials.mockReturnValue({
            data: [
                createMockTrial(false, false), // Not opted in
                createMockTrial(true, true), // Opted in but expired
                createMockTrial(true, false), // Active opted-in trial
            ],
            isLoading: false,
        })
        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: { id: 'pro-plan', name: 'Pro Plan' },
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
        expect(checkbox).toBeDisabled()
    })

    describe('Primary Action Validation', () => {
        beforeEach(() => {
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: { id: 'pro-plan', name: 'Pro Plan' },
                isLoading: false,
            })
        })

        it('disables primary button when primaryAction.isDisabled is true', () => {
            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                },
            })

            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('displays error message when primaryAction.isDisabled is true and errorMessage is provided', () => {
            const errorMessage =
                'AI Agent must be set up for this store to start the trial. Make sure AI agent is deployed on at least one channel.'

            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                    errorMessage,
                },
            })

            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })

        it('displays JSX error message with link when primaryAction.isDisabled is true and errorMessage is JSX', () => {
            const errorMessage = (
                <span>
                    AI Agent must be set up for this store to start the trial.
                    Make sure AI agent is{' '}
                    <a
                        href="/app/ai-agent/shopify/test-store/deploy/chat"
                        className="deployLink"
                    >
                        deployed on at least one channel
                    </a>
                    .
                </span>
            )

            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                    errorMessage,
                },
            })

            expect(
                screen.getByText(
                    /AI Agent must be set up for this store to start the trial\. Make sure AI agent is/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText('deployed on at least one channel'),
            ).toBeInTheDocument()

            const deployLink = screen.getByRole('link', {
                name: 'deployed on at least one channel',
            })
            expect(deployLink).toHaveAttribute(
                'href',
                '/app/ai-agent/shopify/test-store/deploy/chat',
            )
            expect(deployLink).toHaveClass('deployLink')
        })

        it('does not display error message when primaryAction.isDisabled is false', () => {
            const errorMessage =
                'AI Agent must be set up for this store to start the trial. Make sure AI agent is deployed on at least one channel.'

            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: false,
                    errorMessage,
                },
            })

            expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
        })

        it('does not display JSX error message when primaryAction.isDisabled is false', () => {
            const errorMessage = (
                <span>
                    AI Agent must be set up for this store to start the trial.
                    Make sure AI agent is{' '}
                    <a
                        href="/app/ai-agent/shopify/test-store/deploy/chat"
                        className="deployLink"
                    >
                        deployed on at least one channel
                    </a>
                    .
                </span>
            )

            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: false,
                    errorMessage,
                },
            })

            expect(
                screen.queryByText(
                    /AI Agent must be set up for this store to start the trial\. Make sure AI agent is/,
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('deployed on at least one channel'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('link', {
                    name: 'deployed on at least one channel',
                }),
            ).not.toBeInTheDocument()
        })

        it('does not call primaryAction.onClick when button is disabled', async () => {
            const user = userEvent.setup()
            const mockOnClick = jest.fn()

            renderWithProviders({
                showTermsCheckbox: false,
                primaryAction: {
                    ...defaultProps.primaryAction,
                    onClick: mockOnClick,
                    isDisabled: true,
                },
            })

            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            await user.click(primaryButton)

            expect(mockOnClick).not.toHaveBeenCalled()
        })

        it('enables primary button when primaryAction.isDisabled is false', () => {
            renderWithProviders({
                showTermsCheckbox: false,
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: false,
                },
            })

            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            expect(primaryButton).not.toBeDisabled()
        })

        it('enables primary button when primaryAction.isDisabled is undefined', () => {
            renderWithProviders({
                showTermsCheckbox: false,
            })

            const primaryButton = screen.getByRole('button', {
                name: defaultProps.primaryAction.label,
            })

            expect(primaryButton).not.toBeDisabled()
        })

        it('does not display error message when errorMessage is undefined', () => {
            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                    errorMessage: undefined,
                },
            })

            expect(
                screen.queryByText(/AI Agent must be set up/),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('link', {
                    name: 'deployed on at least one channel',
                }),
            ).not.toBeInTheDocument()
        })

        it('does not display error message when errorMessage is null', () => {
            renderWithProviders({
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                    errorMessage: null,
                },
            })

            expect(
                screen.queryByText(/AI Agent must be set up/),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('link', {
                    name: 'deployed on at least one channel',
                }),
            ).not.toBeInTheDocument()
        })

        it('disables button when loading even if primaryAction.isDisabled is false', () => {
            renderWithProviders({
                isLoading: true,
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: false,
                },
            })

            const primaryButton = screen.getByRole('button', {
                name: `Loading... ${defaultProps.primaryAction.label}`,
            })

            expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('disables button when both loading and primaryAction.isDisabled are true', () => {
            renderWithProviders({
                isLoading: true,
                primaryAction: {
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                },
            })

            const primaryButton = screen.getByRole('button', {
                name: `Loading... ${defaultProps.primaryAction.label}`,
            })

            expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
        })
    })
})
