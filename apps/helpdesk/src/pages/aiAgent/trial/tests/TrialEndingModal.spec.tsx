import { assumeMock } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import moment from 'moment'

import { useFlag } from 'core/flags'
import { Cadence } from 'models/billing/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TrialEndedModal } from '../components/TrialEndedModal/TrialEndedModal'
import { TrialEndingModal } from '../components/TrialEndingModal/TrialEndingModal'

// Mock the hooks
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: jest.fn(),
}))

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow', () => ({
    useShoppingAssistantTrialFlow: jest.fn(),
}))

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
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction?.onClick}
                            disabled={secondaryAction?.isDisabled}
                            id={secondaryAction?.id}
                        >
                            {secondaryAction?.label}
                        </button>
                    )}
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
const mockUseFlag = assumeMock(useFlag)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)

const createMockShoppingAssistantTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture({
        onRequestTrialExtension: jest.fn().mockResolvedValue(true),
        ...overrides,
    })

const createMockStoreActivations = (overrides = {}) => ({
    storeActivations: {},
    progressPercentage: 0,
    isFetchLoading: false,
    isSaveLoading: false,
    changeSales: jest.fn(),
    changeSupport: jest.fn(),
    changeSupportChat: jest.fn(),
    changeSupportEmail: jest.fn(),
    saveStoreConfigurations: jest.fn(),
    migrateToNewPricing: jest.fn(),
    endTrial: jest.fn(),
    activation: jest.fn(() => ({
        canActivate: jest.fn(() => ({ isLoading: false, isDisabled: false })),
        activate: jest.fn(),
        isActivating: false,
    })),
    ...overrides,
})

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
            billingPeriod: Cadence.Month,
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            billingPeriod: Cadence.Month,
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
            billingPeriod: Cadence.Month,
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            billingPeriod: Cadence.Month,
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
    trialFinishSetupModal: {
        title: 'Trial Finish Setup',
        subtitle: 'Trial finish setup subtitle',
        content: 'Trial finish setup content',
        primaryAction: {
            label: 'Primary Action',
            onClick: jest.fn(),
        },
    },
    newTrialUpgradePlanModal: {
        title: 'New Trial Upgrade Plan',
        subtitle: 'New trial upgrade plan subtitle',
        currentPlan: {
            title: 'Current Plan',
            description: 'Current plan description',
            price: '$100',
            billingPeriod: Cadence.Month,
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            billingPeriod: Cadence.Month,
            features: [
                { label: 'Feature 1', isError: false },
                { label: 'Feature 2', isError: false },
            ],
            buttonText: 'Upgrade plan',
        },
        onClose: jest.fn(),
        primaryAction: {
            label: 'Primary Action',
            onClick: jest.fn(),
        },
        secondaryAction: {
            label: 'Secondary Action',
            onClick: jest.fn(),
        },
    },
    trialEndingModal: {
        title: 'Shopping Assistant trial ends tomorrow',
        description: 'Trial ending description',
        advantages: [
            '10% average order value',
            '62% conversion rate',
            '1.5% revenue',
        ],
        secondaryDescription: 'Typical results achieved by merchants.',
    },
    trialEndedModal: {
        title: 'Your trial has ended — and it made an impact.',
        description: 'Trial ended description',
        advantages: [
            '10% average order value',
            '62% conversion rate',
            '1.5% revenue',
        ],
        secondaryDescription: 'Typical results achieved by merchants.',
    },
    trialRequestModal: {
        title: 'Request your admin to start trial',
        subtitle:
            'Your Gorgias admins will be notified of your request to start Shopping Assistant trial via both email and an in-app notification.',
        primaryCTALabel: 'Notify Admins',
        accountAdmins: [],
        onPrimaryAction: jest.fn(),
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
            remainingDaysFloat: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            optedOutDatetime: '2023-11-14T00:00:00.000Z', // Has opted out
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
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
            remainingDaysFloat: 1,
            trialEndDatetime: '2023-11-17T00:00:00.000Z',
            optedOutDatetime: '2023-11-16T00:00:00.000Z',
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when already dismissed', () => {
        localStorageMock.getItem.mockReturnValue('true') // Already dismissed

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            remainingDaysFloat: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            optedOutDatetime: '2023-11-14T00:00:00.000Z',
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when user has not opted out', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            remainingDaysFloat: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            optedOutDatetime: undefined, // No opt out
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should dismiss modal when close button is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
            remainingDays: 0,
            remainingDaysFloat: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            optedOutDatetime: '2023-11-14T00:00:00.000Z',
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
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
            remainingDaysFloat: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            optedOutDatetime: '2023-11-14T00:00:00.000Z',
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
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
            remainingDaysFloat: 0,
            trialEndDatetime: '2023-11-15T00:00:00.000Z',
            optedOutDatetime: '2023-11-14T00:00:00.000Z',
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal storeName={mockStoreConfiguration.storeName} />,
        )

        const primaryButton = screen.getByText('Upgrade to Reactivate')
        await user.click(primaryButton)

        // Should not crash (empty function)
        expect(primaryButton).toBeInTheDocument()
    })
})

describe('TrialEndingModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
        mockUseTrialModalProps.mockReturnValue(mockTrialModalProps)
        mockUseFlag.mockReturnValue(false)
        mockUseStoreActivations.mockReturnValue(createMockStoreActivations())
        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            createMockShoppingAssistantTrialFlow(),
        )
    })

    it('should render modal when trial ends tomorrow and not dismissed', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            remainingDaysFloat: 0.5, // Less than 1 day
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            optedOutDatetime: undefined,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal storeName={mockStoreConfiguration.storeName} />,
        )

        expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        expect(
            screen.getByText('Shopping Assistant trial ends tomorrow'),
        ).toBeInTheDocument()
        expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })

    it('should not render modal when remaining days is not 1', () => {
        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-17T00:00:00.000Z',
            remainingDays: 2,
            remainingDaysFloat: 2,
            trialEndDatetime: '2023-11-17T00:00:00.000Z',
            optedOutDatetime: undefined,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingModal storeName={mockStoreConfiguration.storeName} />,
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
            remainingDaysFloat: 0.5, // Less than 1 day
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            optedOutDatetime: undefined,
        })

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingModal storeName={mockStoreConfiguration.storeName} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should dismiss modal when close button is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            remainingDaysFloat: 0.5, // Less than 1 day
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            optedOutDatetime: undefined,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal storeName={mockStoreConfiguration.storeName} />,
        )

        const closeButton = screen.getByText('Close')
        await user.click(closeButton)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'ai-agent-trial-ending-tomorrow-dismissed',
            'true',
        )
    })

    it('should dismiss modal when primary action (Dismiss) is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue({
            trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
            remainingDays: 1,
            remainingDaysFloat: 0.5, // Less than 1 day
            trialEndDatetime: '2023-11-16T00:00:00.000Z',
            optedOutDatetime: undefined,
        })

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal storeName={mockStoreConfiguration.storeName} />,
        )

        const primaryButton = screen.getByText('Dismiss')
        await user.click(primaryButton)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'ai-agent-trial-ending-tomorrow-dismissed',
            'true',
        )
    })

    describe('when user has opted out and feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseTrialEnding.mockReturnValue({
                trialTerminationDatetime: '2023-11-16T00:00:00.000Z',
                remainingDays: 1,
                remainingDaysFloat: 0.5,
                trialEndDatetime: '2023-11-16T00:00:00.000Z',
                optedOutDatetime: '2023-11-15T00:00:00.000Z', // User has opted out
            })
        })

        it('should show upgrade and trial extension options', () => {
            renderWithStoreAndQueryClientProvider(
                <TrialEndingModal
                    storeName={mockStoreConfiguration.storeName}
                />,
            )

            expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
            expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
            expect(
                screen.getByText('Request Trial Extension'),
            ).toBeInTheDocument()
        })

        it('should call openUpgradePlanModal when Upgrade Now is clicked', async () => {
            const user = userEvent.setup()
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                createMockShoppingAssistantTrialFlow({
                    openUpgradePlanModal: mockOpenUpgradePlanModal,
                }),
            )

            renderWithStoreAndQueryClientProvider(
                <TrialEndingModal
                    storeName={mockStoreConfiguration.storeName}
                />,
            )

            const upgradeButton = screen.getByText('Upgrade Now')

            await act(async () => {
                await user.click(upgradeButton)
            })

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('should call onRequestTrialExtension when Request Trial Extension is clicked', async () => {
            const user = userEvent.setup()
            const mockOnRequestTrialExtension = jest
                .fn()
                .mockResolvedValue(true)

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                createMockShoppingAssistantTrialFlow({
                    onRequestTrialExtension: mockOnRequestTrialExtension,
                }),
            )

            renderWithStoreAndQueryClientProvider(
                <TrialEndingModal
                    storeName={mockStoreConfiguration.storeName}
                />,
            )

            const extensionButton = screen.getByText('Request Trial Extension')
            await user.click(extensionButton)

            expect(mockOnRequestTrialExtension).toHaveBeenCalled()
        })

        it('should disable extension button and not call onRequestTrialExtension when extension cannot be requested due to cooldown', async () => {
            // Set up localStorage BEFORE any component rendering to simulate a recent extension request
            const recentTimestamp = moment().valueOf()
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'ai-agent-trial-extension-requested-timestamp') {
                    return recentTimestamp.toString()
                }
                return null
            })

            const mockOnRequestTrialExtension = jest
                .fn()
                .mockResolvedValue(true)

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                createMockShoppingAssistantTrialFlow({
                    onRequestTrialExtension: mockOnRequestTrialExtension,
                }),
            )

            renderWithStoreAndQueryClientProvider(
                <TrialEndingModal
                    storeName={mockStoreConfiguration.storeName}
                />,
            )

            const extensionButton = screen.getByText('Request Trial Extension')

            // The button should be disabled due to cooldown
            expect(extensionButton).toBeDisabled()

            // Even if we try to click it, the function should not be called
            const user = userEvent.setup()
            await user.click(extensionButton)

            expect(mockOnRequestTrialExtension).not.toHaveBeenCalled()
        })
    })
})
