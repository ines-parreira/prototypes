import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import moment from 'moment'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import {
    TrialEndedModal,
    TrialEndingTomorrowModal,
} from '../components/TrialEndingModal/TrialEndingModal'

// Mock the hooks
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')

// Mock TrialManageModal
jest.mock(
    'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal',
    () => ({
        TrialManageModal: jest.fn(
            ({
                title,
                description,
                onClose,
                primaryAction,
                secondaryAction,
            }) => (
                <div data-testid="trial-manage-modal">
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <button onClick={primaryAction?.onClick}>
                        {primaryAction?.label}
                    </button>
                    <button onClick={secondaryAction?.onClick}>
                        {secondaryAction?.label}
                    </button>
                    <button onClick={onClose}>Close</button>
                </div>
            ),
        ),
    }),
)

const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockUseTrialEnding = assumeMock(useTrialEnding)
const mockUseTrialModalProps = assumeMock(useTrialModalProps)

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

const mockStoreConfiguration = getStoreConfigurationFixture({
    storeName: 'test-store',
    sales: {
        trial: {
            startDatetime: '2023-11-01T00:00:00.000Z',
            endDatetime: '2023-11-15T00:00:00.000Z',
            account: {
                plannedUpgradeDatetime: null,
                optInDatetime: null,
                optOutDatetime: null,
                actualUpgradeDatetime: null,
                actualTerminationDatetime: null,
            },
        },
    },
})

const mockTrialModalProps = {
    trialUpgradePlanModal: {
        title: 'Test Trial Upgrade Title',
        currentPlan: {
            title: 'Current Plan',
            description: 'Current plan description',
            price: '$100',
            billingPeriod: 'month',
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            billingPeriod: 'month',
            features: [
                { label: 'Feature 1', isError: false },
                { label: 'Feature 2', isError: false },
            ],
            buttonText: 'Upgrade plan',
        },
    },
    upgradePlanModal: {
        title: 'Test Upgrade Title',
        currentPlan: {
            title: 'Current Plan',
            description: 'Current plan description',
            price: '$100',
            billingPeriod: 'month',
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            billingPeriod: 'month',
            features: [
                { label: 'Feature 1', isError: false },
                { label: 'Feature 2', isError: false },
            ],
            buttonText: 'Upgrade plan',
        },
    },
    trialActivatedModal: {
        title: 'Trial Activated',
    },
    trialStartedBanner: {
        title: 'Trial Started',
        description: 'Trial started description',
        primaryAction: {
            label: 'Primary Action',
            onClick: jest.fn(),
        },
        secondaryAction: {
            label: 'Secondary Action',
            onClick: jest.fn(),
        },
    },
    trialAlertBanner: {
        title: 'Trial Alert',
        description: 'Trial alert description',
        primaryAction: {
            label: 'Primary Action',
            onClick: jest.fn(),
        },
        secondaryAction: {
            label: 'Secondary Action',
            onClick: jest.fn(),
        },
    },
    manageTrialModal: {
        description: 'Test trial description',
        advantages: ['Advantage 1', 'Advantage 2'],
        secondaryDescription: 'Secondary description',
    },
}

describe('TrialEndedModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
        mockUseTrialModalProps.mockReturnValue(mockTrialModalProps)

        // Mock moment to control "now"
        jest.spyOn(moment, 'now').mockReturnValue(
            moment('2023-11-16T00:00:00.000Z').valueOf(),
        )
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render modal when trial has ended and not dismissed', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        expect(
            screen.getByText('Your trial has ended — and it made an impact.'),
        ).toBeInTheDocument()
    })

    it('should not render modal when trial has not ended', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-17T00:00:00.000Z', // Future date
            remainingDays: 1,
            trialEndDatetime: '2023-11-17T00:00:00.000Z',
            forceHideModal: false,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when already dismissed', () => {
        localStorageMock.getItem.mockReturnValue('true') // Already dismissed

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            forceHideModal: false,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when revamp milestone is not enabled', () => {
        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            forceHideModal: false,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should dismiss modal when close button is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        const closeButton = screen.getByText('Close')
        await user.click(closeButton)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'ai-agent-trial-ended-dismissed',
            'true',
        )
    })

    it('should dismiss modal when secondary action is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        const secondaryButton = screen.getByText('No, thanks')
        await user.click(secondaryButton)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'ai-agent-trial-ended-dismissed',
            'true',
        )
    })

    it('should call empty function when primary action is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeConfiguration={mockStoreConfiguration} />,
        )

        const primaryButton = screen.getByText('Upgrade to Reactivate')
        await user.click(primaryButton)

        // Should not crash (empty function)
        expect(primaryButton).toBeInTheDocument()
    })
})

describe('TrialEndingTomorrowModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
        mockUseTrialModalProps.mockReturnValue(mockTrialModalProps)
    })

    it('should render modal when trial ends tomorrow and not dismissed', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndingTomorrowModal
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        expect(
            screen.getByText('Shopping Assistant trial ends tomorrow'),
        ).toBeInTheDocument()
    })

    it('should not render modal when remaining days is not 1', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-17T00:00:00.000Z',
            remainingDays: 2,
            trialEndDatetime: '2023-11-17T00:00:00.000Z',
            forceHideModal: false,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingTomorrowModal
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when already dismissed', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'ai-agent-trial-ending-tomorrow-dismissed') {
                return 'true'
            }
            return null
        })

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            forceHideModal: false,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingTomorrowModal
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should dismiss modal when close button is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndingTomorrowModal
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        const closeButton = screen.getByText('Close')
        await user.click(closeButton)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'ai-agent-trial-ending-tomorrow-dismissed',
            'true',
        )
    })

    it('should call empty function when primary action is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            forceHideModal: false,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndingTomorrowModal
                storeConfiguration={mockStoreConfiguration}
            />,
        )

        const primaryButton = screen.getByText('Upgrade to Reactivate')
        await user.click(primaryButton)

        // Should not crash (empty function)
        expect(primaryButton).toBeInTheDocument()
    })
})
