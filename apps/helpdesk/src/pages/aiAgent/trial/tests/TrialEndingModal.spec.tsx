import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import moment from 'moment'

import { Cadence } from 'models/billing/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_ADVANTAGES } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { getUseTrialEndingFixture } from 'pages/aiAgent/fixtures/useTrialEnding.fixture'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import type { TrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import type { TrialFinishSetupFeature } from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TrialEndedModal } from '../components/TrialEndedModal/TrialEndedModal'
import { TrialEndingModal } from '../components/TrialEndingModal/TrialEndingModal'

// Mock the hooks
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
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
const mockUseUpgradePlan = assumeMock(useUpgradePlan)

const createMockShoppingAssistantTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture({
        onRequestTrialExtension: jest.fn().mockResolvedValue(true),
        ...overrides,
    })

const createMockStoreActivations = (overrides = {}) => ({
    storeActivations: {},
    allStoreActivations: {},
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

const mockFeatures: TrialFinishSetupFeature[] = [
    {
        icon: 'check',
        title: 'Test Feature 1',
        description: 'Test description 1',
    },
    {
        icon: 'star',
        title: 'Test Feature 2',
        description: 'Test description 2',
    },
]

const createMockTrialEndingFixture = (overrides = {}) =>
    getUseTrialEndingFixture({
        trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
        remainingDays: 0,
        remainingDaysFloat: 0,
        trialEndDatetime: '2023-11-15T00:00:00.000Z',
        optedOutDatetime: '2023-11-14T00:00:00.000Z',
        ...overrides,
    })

const mockTrialEndingTomorrowFixture = (overrides = {}) =>
    createMockTrialEndingFixture({
        trialTerminationDatetime: null,
        remainingDays: 1,
        remainingDaysFloat: 0.5,
        trialEndDatetime: '2023-11-16T00:00:00.000Z',
        optedOutDatetime: null,
        ...overrides,
    })

const createMockTrialModalProps = (): TrialModalProps => ({
    trialUpgradePlanModal: {
        title: 'Test Trial Upgrade Title',
        currentPlan: {
            title: 'Current Plan',
            description: 'Current plan description',
            price: '$100',
            currency: 'USD',
            billingPeriod: Cadence.Month,
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            currency: 'USD',
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
            currency: 'USD',
            billingPeriod: Cadence.Month,
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            currency: 'USD',
            billingPeriod: Cadence.Month,
            features: [
                { label: 'Feature 1', isError: false },
                { label: 'Feature 2', isError: false },
            ],
            buttonText: 'Upgrade plan',
        },
        isOpen: false,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        onDismiss: jest.fn(),
        isLoading: false,
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
        isOpen: false,
        onClose: jest.fn(),
        features: mockFeatures,
    },
    newTrialUpgradePlanModal: {
        title: 'New Trial Upgrade Plan',
        subtitle: 'New trial upgrade plan subtitle',
        currentPlan: {
            title: 'Current Plan',
            description: 'Current plan description',
            price: '$100',
            currency: 'USD',
            billingPeriod: Cadence.Month,
            features: [{ label: 'Feature 1', isError: false }],
            buttonText: 'Keep current plan',
        },
        newPlan: {
            title: 'New Plan',
            description: 'New plan description',
            price: '$200',
            currency: 'USD',
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
        features: [
            {
                icon: 'check',
                title: 'Today',
                description: 'Test feature description',
            },
        ],
    },
    trialEndingModal: {
        title: 'Shopping Assistant trial ends tomorrow',
        description: 'Trial ending description',
        advantages: SHOPPING_ASSISTANT_ADVANTAGES,
        secondaryDescription: 'Typical results achieved by merchants.',
    },
    trialEndedModal: {
        title: 'Your trial has ended — and it made an impact.',
        description: 'Trial ended description',
        advantages: SHOPPING_ASSISTANT_ADVANTAGES,
        secondaryDescription: 'Typical results achieved by merchants.',
    },
    trialManageModal: {
        title: 'Manage trial',
        description: 'Manage description',
        advantages: SHOPPING_ASSISTANT_ADVANTAGES,
        secondaryDescription: 'Secondary description',
        onClose: jest.fn(),
        primaryAction: {
            label: 'Upgrade Now',
            onClick: jest.fn(),
        },
        secondaryAction: {
            label: 'Opt Out',
            onClick: jest.fn(),
        },
        isOpen: false,
    } as any,
    trialOptOutModal: {
        isOpen: false,
        isTrialExtended: false,
        trialType: TrialType.ShoppingAssistant,
        onClose: jest.fn(),
        onRequestTrialExtension: jest.fn(),
    },
    trialRequestModal: {
        title: 'Request your admin to start trial',
        subtitle:
            'Your Gorgias admins will be notified of your request to start Shopping Assistant trial via both email and an in-app notification.',
        primaryCTALabel: 'Notify Admins',
        accountAdmins: [],
        onPrimaryAction: jest.fn(),
    },
})
describe('TrialEndedModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
        mockUseTrialModalProps.mockReturnValue(createMockTrialModalProps())
        mockUseFlag.mockReturnValue(false)
        mockUseStoreActivations.mockReturnValue(createMockStoreActivations())
        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            createMockShoppingAssistantTrialFlow(),
        )
        mockUseUpgradePlan.mockReturnValue({
            upgradePlan: jest.fn(),
            upgradePlanAsync: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })

        // Mock moment to control "now" - this is crucial for the date logic tests
        jest.spyOn(moment, 'now').mockReturnValue(
            moment('2023-11-16T00:00:00.000Z').valueOf(),
        )
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render modal when trial has ended and not dismissed', () => {
        mockUseTrialEnding.mockReturnValue(createMockTrialEndingFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        expect(
            screen.getByText('Your trial has ended — and it made an impact.'),
        ).toBeInTheDocument()
    })

    it('should not render modal when trial has not ended', () => {
        mockUseTrialEnding.mockReturnValue(
            createMockTrialEndingFixture({
                trialTerminationDatetime: '2023-11-17T00:00:00.000Z',
                remainingDays: 1,
                remainingDaysFloat: 1,
                trialEndDatetime: '2023-11-17T00:00:00.000Z',
                optedOutDatetime: '2023-11-16T00:00:00.000Z',
            }),
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when already dismissed', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (
                key ===
                `ai-agent-trial-ended-dismissed:${mockStoreConfiguration.storeName}:shoppingAssistant`
            ) {
                return 'true'
            }
            return null
        })

        mockUseTrialEnding.mockReturnValue(createMockTrialEndingFixture())

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when user has not opted out', () => {
        mockUseTrialEnding.mockReturnValue(
            createMockTrialEndingFixture({
                optedOutDatetime: null,
            }),
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should dismiss modal when close button is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue(createMockTrialEndingFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        const closeButton = screen.getByText('Close')

        await act(async () => {
            await user.click(closeButton)
        })

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            `ai-agent-trial-ended-dismissed:${mockStoreConfiguration.storeName}:shoppingAssistant`,
            'true',
        )

        // Wait for any pending state updates
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })
    })

    it('should dismiss modal when secondary action is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue(createMockTrialEndingFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        const secondaryButton = screen.getByText('No, thanks')

        await act(async () => {
            await user.click(secondaryButton)
        })

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            `ai-agent-trial-ended-dismissed:${mockStoreConfiguration.storeName}:shoppingAssistant`,
            'true',
        )

        // Wait for any pending state updates
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })
    })

    it('should call upgradePlanAsync when primary action is clicked', async () => {
        const user = userEvent.setup()
        const mockUpgradePlanAsync = jest.fn().mockResolvedValue(undefined)

        mockUseUpgradePlan.mockReturnValue({
            upgradePlan: jest.fn(),
            upgradePlanAsync: mockUpgradePlanAsync,
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })

        mockUseTrialEnding.mockReturnValue(createMockTrialEndingFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndedModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        const primaryButton = screen.getByText('Upgrade to Reactivate')

        await act(async () => {
            await user.click(primaryButton)
        })

        expect(mockUpgradePlanAsync).toHaveBeenCalled()
    })
})

describe('TrialEndingModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
        mockUseTrialModalProps.mockReturnValue(createMockTrialModalProps())
        mockUseFlag.mockReturnValue(false)
        mockUseStoreActivations.mockReturnValue(createMockStoreActivations())
        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            createMockShoppingAssistantTrialFlow(),
        )
        mockUseUpgradePlan.mockReturnValue({
            upgradePlan: jest.fn(),
            upgradePlanAsync: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })

        // Mock moment to control "now" - this is crucial for the date logic tests
        jest.spyOn(moment, 'now').mockReturnValue(
            moment('2023-11-16T00:00:00.000Z').valueOf(),
        )
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should call useTrialEnding with correct parameters', () => {
        mockUseTrialEnding.mockReturnValue(mockTrialEndingTomorrowFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(mockUseTrialEnding).toHaveBeenCalledWith(
            mockStoreConfiguration.storeName,
            TrialType.ShoppingAssistant,
        )
    })

    it('should render modal when trial ends tomorrow and not dismissed', () => {
        mockUseTrialEnding.mockReturnValue(mockTrialEndingTomorrowFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        expect(
            screen.getByText('Shopping Assistant trial ends tomorrow'),
        ).toBeInTheDocument()
        expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })

    it('should not render modal when remaining days is not 1', () => {
        mockUseTrialEnding.mockReturnValue(
            createMockTrialEndingFixture({
                trialTerminationDatetime: null,
                remainingDays: 2,
                remainingDaysFloat: 2,
                trialEndDatetime: '2023-11-17T00:00:00.000Z',
                optedOutDatetime: null,
            }),
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when already dismissed', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (
                key ===
                `ai-agent-trial-ending-tomorrow-dismissed:${mockStoreConfiguration.storeName}:shoppingAssistant`
            ) {
                return 'true'
            }
            return null
        })

        mockUseTrialEnding.mockReturnValue(mockTrialEndingTomorrowFixture())

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should not render modal when trialTerminationDatetime is set even if trial ends tomorrow', () => {
        mockUseTrialEnding.mockReturnValue(
            createMockTrialEndingFixture({
                trialTerminationDatetime: '2023-11-15T00:00:00.000Z',
                remainingDays: 1,
                remainingDaysFloat: 0.5,
                trialEndDatetime: '2023-11-16T00:00:00.000Z',
                optedOutDatetime: null,
            }),
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should dismiss modal when close button is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue(mockTrialEndingTomorrowFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        const closeButton = screen.getByText('Close')

        await act(async () => {
            await user.click(closeButton)
        })

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            `ai-agent-trial-ending-tomorrow-dismissed:${mockStoreConfiguration.storeName}:shoppingAssistant`,
            'true',
        )

        // Wait for any pending state updates
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })
    })

    it('should dismiss modal when primary action (Dismiss) is clicked', async () => {
        const user = userEvent.setup()

        mockUseTrialEnding.mockReturnValue(mockTrialEndingTomorrowFixture())

        renderWithStoreAndQueryClientProvider(
            <TrialEndingModal
                storeName={mockStoreConfiguration.storeName}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        const primaryButton = screen.getByText('Dismiss')

        await act(async () => {
            await user.click(primaryButton)
        })

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            `ai-agent-trial-ending-tomorrow-dismissed:${mockStoreConfiguration.storeName}:shoppingAssistant`,
            'true',
        )

        // Wait for any pending state updates
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })
    })

    describe('when user has opted out and feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseTrialEnding.mockReturnValue(
                createMockTrialEndingFixture({
                    trialTerminationDatetime: null,
                    remainingDays: 1,
                    remainingDaysFloat: 0.5,
                    trialEndDatetime: '2023-11-16T00:00:00.000Z',
                    optedOutDatetime: '2023-11-15T00:00:00.000Z',
                }),
            )
        })

        it('should show upgrade and trial extension options', () => {
            renderWithStoreAndQueryClientProvider(
                <TrialEndingModal
                    storeName={mockStoreConfiguration.storeName}
                    trialType={TrialType.ShoppingAssistant}
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
                    trialType={TrialType.ShoppingAssistant}
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
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const extensionButton = screen.getByText('Request Trial Extension')

            await act(async () => {
                await user.click(extensionButton)
            })

            expect(mockOnRequestTrialExtension).toHaveBeenCalled()

            // Wait for any pending state updates
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0))
            })
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
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const extensionButton = screen.getByText('Request Trial Extension')

            // The button should be disabled due to cooldown
            expect(extensionButton).toBeDisabled()

            // Even if we try to click it, the function should not be called
            const user = userEvent.setup()

            await act(async () => {
                await user.click(extensionButton)
            })

            expect(mockOnRequestTrialExtension).not.toHaveBeenCalled()

            // Wait for any pending state updates
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0))
            })
        })
    })
})
