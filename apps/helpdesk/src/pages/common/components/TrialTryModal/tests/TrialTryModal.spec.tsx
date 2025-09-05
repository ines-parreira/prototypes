import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { Trial } from 'models/aiAgent/types'
import { Cadence, cadenceNames } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

import TrialTryModal, { TrialFeature } from '../TrialTryModal'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgent/queries')

const mockCurrentPlan = {
    name: 'Basic',
    price: '$50',
    billingPeriod: Cadence.Month,
    priceTooltipText: `Billed ${cadenceNames[Cadence.Month]} at $50 per seat`,
} as unknown as PlanDetails

const mockNewPlan = {
    name: 'Pro',
    price: '$100',
    billingPeriod: Cadence.Month,
    priceTooltipText: `Billed ${cadenceNames[Cadence.Month]} at $100 per seat`,
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

    it('displays current and new plan pricing information', () => {
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

    it('renders terms checkbox when showTermsCheckbox is true', () => {
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

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup()
        renderWithProviders()

        const closeButton = screen.getByRole('button', {
            name: defaultProps.secondaryAction.label,
        })
        await user.click(closeButton)

        expect(defaultProps.secondaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('handles terms checkbox interaction when no existing trial', async () => {
        const user = userEvent.setup()
        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)
        expect(checkbox).toBeChecked()
    })

    it('calls primaryAction.onClick when terms are accepted and primary button is clicked', async () => {
        const user = userEvent.setup()
        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('does not call primaryAction.onClick when terms are not accepted', async () => {
        const user = userEvent.setup()
        renderWithProviders()

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).not.toHaveBeenCalled()
    })

    it('displays "Today" and "0" when currentPlan is null', () => {
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

    it('pre-checks and disables terms checkbox when there is an active opted-in trial', () => {
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(true, false)],
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
        expect(checkbox).toBeDisabled()
    })

    it('does not pre-check terms checkbox when trial has expired', () => {
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(true, true)],
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
        expect(checkbox).not.toBeDisabled()
    })

    it('does not pre-check terms checkbox when trial is not opted-in', () => {
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(false, false)],
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
        expect(checkbox).not.toBeDisabled()
    })

    it('calls primaryAction.onClick directly when terms are pre-checked due to existing trial', async () => {
        const user = userEvent.setup()
        mockUseGetTrials.mockReturnValue({
            data: [createMockTrial(true, false)],
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

    it('handles multiple trials with mixed states correctly', () => {
        mockUseGetTrials.mockReturnValue({
            data: [
                createMockTrial(false, false), // Not opted in
                createMockTrial(true, true), // Opted in but expired
                createMockTrial(true, false), // Active opted-in trial
            ],
            isLoading: false,
        })

        renderWithProviders()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
        expect(checkbox).toBeDisabled()
    })
})
