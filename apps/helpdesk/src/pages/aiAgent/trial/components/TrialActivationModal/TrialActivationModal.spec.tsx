import { configureStore } from '@reduxjs/toolkit'
import { render } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import type { Trial } from 'models/aiAgent/types'
import { Cadence } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import type { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

import { TrialActivationModal } from './TrialActivationModal'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgent/queries')
jest.mock('hooks/aiAgent/useAiAgentUpgradePlan')

const mockNewPlan = {
    name: 'Pro',
    price: '$30',
    billingPeriod: Cadence.Month,
} as unknown as PlanDetails

const mockStore = configureStore({
    reducer: {
        currentAccount: () => ({ domain: 'test-domain' }),
    },
})

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
})

const mockUseAppSelector = jest.requireMock(
    'hooks/useAppSelector',
).useAppSelector
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

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    trialType: TrialType.AiAgent,
    newPlan: mockNewPlan,
    isLoading: false,
    isConfirmDisabled: false,
}

const renderModal = (
    overrides: Partial<typeof defaultProps> = {},
    {
        upgradePlanData = { id: 'pro', name: 'Pro' } as {
            id: string
            name: string
        } | null,
        trials = [] as Trial[],
        upgradePlanLoading = false,
        trialsLoading = false,
    } = {},
) => {
    mockUseAppSelector.mockReturnValue(mockCurrentAccount)
    mockUseGetTrials.mockReturnValue({
        data: trials,
        isLoading: trialsLoading,
    })
    mockUseAiAgentUpgradePlan.mockReturnValue({
        data: upgradePlanData,
        isLoading: upgradePlanLoading,
    })

    return render(
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                <TrialActivationModal {...defaultProps} {...overrides} />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('<TrialActivationModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders heading, pricing rows, and timeline when open', () => {
        renderModal()

        expect(
            screen.getByRole('heading', {
                name: /Your AI Agent is ready to go live/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getAllByText('Today')).toHaveLength(2)
        expect(screen.getByText('$0')).toBeInTheDocument()
        expect(screen.getByText('After trial ends')).toBeInTheDocument()
        expect(screen.getByText('$30 / month')).toBeInTheDocument()
        expect(screen.getByText('Day 7')).toBeInTheDocument()
        expect(screen.getByText('Day 14')).toBeInTheDocument()
    })

    it('renders AI Agent ("shoppers") description for TrialType.AiAgent', () => {
        renderModal({ trialType: TrialType.AiAgent })

        expect(
            screen.getByText(/working for your shoppers/i),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/working for your customers/i),
        ).not.toBeInTheDocument()
    })

    it('renders Shopping Assistant ("customers") description for TrialType.ShoppingAssistant', () => {
        renderModal({ trialType: TrialType.ShoppingAssistant })

        expect(
            screen.getByText(/working for your customers/i),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/working for your shoppers/i),
        ).not.toBeInTheDocument()
    })

    it('does not render the modal while trials are loading', () => {
        renderModal({}, { trialsLoading: true })

        expect(
            screen.queryByRole('heading', {
                name: /Your AI Agent is ready to go live/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('renders contact-us fallback and disables Start trial when no upgrade plan', () => {
        renderModal({}, { upgradePlanData: null })

        expect(
            screen.getByText(
                /Please get in touch with our team to start your free trial/i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/I agree to the updated pricing/i),
        ).not.toBeInTheDocument()

        const startTrial = screen.getByRole('button', { name: /Start trial/i })
        expect(startTrial).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables only Start trial when confirmation is disabled', () => {
        renderModal({ isConfirmDisabled: true })

        expect(
            screen.getByRole('button', { name: /Start trial/i }),
        ).toHaveAttribute('aria-disabled', 'true')

        const notNowButton = screen.getByRole('button', { name: /Not now/i })
        expect(notNowButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('disables both modal actions while loading', () => {
        renderModal({ isLoading: true })

        expect(
            screen.getByRole('button', { name: /Start trial/i }),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(
            screen.getByRole('button', { name: /Not now/i }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not call onConfirm when terms are unchecked', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderModal({ onConfirm })

        await user.click(screen.getByRole('button', { name: /Start trial/i }))

        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('calls onConfirm with isTermsChecked=true after the user accepts terms', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderModal({ onConfirm })

        await user.click(screen.getByRole('checkbox'))
        await user.click(screen.getByRole('button', { name: /Start trial/i }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
        expect(onConfirm).toHaveBeenCalledWith(true)
    })

    it('disables Start trial immediately after confirming, before the parent reports loading', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderModal({ onConfirm, isLoading: false })

        await user.click(screen.getByRole('checkbox'))
        const startTrial = screen.getByRole('button', { name: /Start trial/i })
        await user.click(startTrial)

        expect(onConfirm).toHaveBeenCalledTimes(1)
        expect(startTrial).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not call onConfirm more than once on rapid double-click', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderModal({ onConfirm, isLoading: false })

        await user.click(screen.getByRole('checkbox'))
        const startTrial = screen.getByRole('button', { name: /Start trial/i })
        await user.click(startTrial)
        await user.click(startTrial)

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('pre-checks and disables the terms checkbox when an active opted-in trial exists', () => {
        renderModal({}, { trials: [createMockTrial(true, false)] })

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
        expect(checkbox).toBeDisabled()
    })

    it('does not pre-check the terms checkbox for expired trials', () => {
        renderModal({}, { trials: [createMockTrial(true, true)] })

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
        expect(checkbox).not.toBeDisabled()
    })

    it('confirms directly when terms are pre-checked via existing opted-in trial', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderModal({ onConfirm }, { trials: [createMockTrial(true, false)] })

        await user.click(screen.getByRole('button', { name: /Start trial/i }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
        expect(onConfirm).toHaveBeenCalledWith(true)
    })

    it('calls onClose when the user clicks "Not now"', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderModal({ onClose })

        await user.click(screen.getByRole('button', { name: /Not now/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
