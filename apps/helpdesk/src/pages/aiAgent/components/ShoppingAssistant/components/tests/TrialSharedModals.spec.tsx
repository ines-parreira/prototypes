import { render, screen } from '@testing-library/react'

import { Cadence } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

import { TrialSharedModals, TrialSharedModalsProps } from '../TrialSharedModals'

const mockTrialManageModal = {
    title: 'Manage Trial',
    description: 'Manage your trial settings',
    advantages: ['Advantage 1', 'Advantage 2'],
    secondaryDescription: 'Secondary description',
    onClose: jest.fn(),
    primaryAction: {
        label: 'Primary Action',
        onClick: jest.fn(),
    },
    secondaryAction: {
        label: 'Secondary Action',
        onClick: jest.fn(),
    },
    isOpen: false,
}

const mockUpgradePlanModal = {
    title: 'Upgrade Plan',
    currentPlan: {
        title: 'Current Plan',
        description: 'Current plan description',
        price: '$100',
        currency: 'USD',
        billingPeriod: Cadence.Month,
        features: [],
        buttonText: 'Keep current',
    },
    newPlan: {
        title: 'New Plan',
        description: 'New plan description',
        price: '$200',
        currency: 'USD',
        billingPeriod: Cadence.Month,
        features: [],
        buttonText: 'Upgrade',
        priceTooltipText: 'Price tooltip',
    },
    isOpen: false,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    onDismiss: jest.fn(),
    isLoading: false,
}

const mockTrialOptOutModal = {
    isOpen: false,
    isTrialExtended: false,
    trialType: TrialType.ShoppingAssistant,
    onClose: jest.fn(),
    onRequestTrialExtension: jest.fn(),
}

const mockTrialFinishSetupModal = {
    title: 'Finish Setup',
    subtitle: 'Complete your setup',
    content: 'Setup content',
    primaryAction: {
        label: 'Finish',
        onClick: jest.fn(),
    },
    isOpen: false,
    onClose: jest.fn(),
}

const defaultProps: TrialSharedModalsProps = {
    shopName: 'Test Shop',
    trialType: TrialType.ShoppingAssistant,
    trialModalProps: {
        trialManageModal: mockTrialManageModal,
        upgradePlanModal: mockUpgradePlanModal,
        trialOptOutModal: mockTrialOptOutModal,
        trialFinishSetupModal: mockTrialFinishSetupModal,
        trialUpgradePlanModal: {
            title: 'Trial Upgrade Plan',
            currentPlan: mockUpgradePlanModal.currentPlan,
            newPlan: mockUpgradePlanModal.newPlan,
        },
        trialActivatedModal: {
            title: 'Trial Activated',
        },
        trialStartedBanner: {
            title: 'Trial Started',
            description: 'Your trial has started',
            primaryAction: {
                label: 'Primary',
                onClick: jest.fn(),
            },
            secondaryAction: {
                label: 'Secondary',
                onClick: jest.fn(),
            },
        },
        trialAlertBanner: {
            title: 'Trial Alert',
            description: 'Trial alert description',
            primaryAction: {
                label: 'Primary',
                onClick: jest.fn(),
            },
            secondaryAction: {
                label: 'Secondary',
                onClick: jest.fn(),
            },
        },
        trialEndingModal: {
            title: 'Trial Ending',
            description: 'Your trial is ending',
            advantages: ['Advantage 1'],
            secondaryDescription: 'Secondary description',
        },
        trialEndedModal: {
            title: 'Trial Ended',
            description: 'Your trial has ended',
            advantages: ['Advantage 1'],
            secondaryDescription: 'Secondary description',
        },
        newTrialUpgradePlanModal: {
            title: 'New Trial Upgrade',
            subtitle: 'Upgrade subtitle',
            currentPlan: mockUpgradePlanModal.currentPlan,
            newPlan: mockUpgradePlanModal.newPlan,
            primaryAction: {
                label: 'Start trial',
                onClick: jest.fn(),
            },
            secondaryAction: {
                label: 'No thanks',
                onClick: jest.fn(),
            },
            onClose: jest.fn(),
            features: [],
        },
        trialRequestModal: {
            title: 'Request Trial',
            subtitle: 'Request subtitle',
            primaryCTALabel: 'Request',
            accountAdmins: [],
            onPrimaryAction: jest.fn(),
        },
    },
}

jest.mock(
    'pages/aiAgent/trial/components/TrialEndedModal/TrialEndedModal',
    () => ({
        TrialEndedModal: ({
            storeName,
            trialType,
        }: {
            storeName: string
            trialType: TrialType
        }) => (
            <div data-testid="trial-ended-modal">
                TrialEndedModal - {storeName} - {trialType}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal',
    () => ({
        TrialEndingModal: ({
            storeName,
            trialType,
        }: {
            storeName: string
            trialType: TrialType
        }) => (
            <div data-testid="trial-ending-modal">
                TrialEndingModal - {storeName} - {trialType}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal',
    () => ({
        TrialManageModal: (props: any) => (
            <div data-testid="trial-manage-modal">
                TrialManageModal - {props.title}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/TrialOptOutModal/TrialOptOutModal',
    () => ({
        __esModule: true,
        default: (props: any) =>
            props.isOpen ? (
                <div data-testid="trial-opt-out-modal">
                    TrialOptOutModal - {props.isOpen ? 'open' : 'closed'}
                </div>
            ) : null,
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal',
    () => ({
        UpgradePlanModal: (props: any) =>
            props.isOpen ? (
                <div data-testid="upgrade-plan-modal">
                    UpgradePlanModal - {props.isOpen ? 'open' : 'closed'}
                </div>
            ) : null,
    }),
)

jest.mock(
    'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal',
    () => ({
        __esModule: true,
        default: (props: any) => (
            <div data-testid="trial-finish-setup-modal">
                TrialFinishSetupModal - {props.title}
            </div>
        ),
    }),
)

describe('TrialSharedModals', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal components that are always visible', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(screen.getByTestId('trial-ended-modal')).toBeInTheDocument()
        expect(screen.getByTestId('trial-ending-modal')).toBeInTheDocument()
        expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        expect(
            screen.getByTestId('trial-finish-setup-modal'),
        ).toBeInTheDocument()
    })

    it('should pass correct props to TrialEndedModal', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(
            screen.getByText('TrialEndedModal - Test Shop - shoppingAssistant'),
        ).toBeInTheDocument()
    })

    it('should pass correct props to TrialEndingModal when shopName is provided', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(
            screen.getByText(
                'TrialEndingModal - Test Shop - shoppingAssistant',
            ),
        ).toBeInTheDocument()
    })

    it('should pass trial modal props to TrialManageModal', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(
            screen.getByText('TrialManageModal - Manage Trial'),
        ).toBeInTheDocument()
    })

    it('should conditionally render UpgradePlanModal when open', () => {
        const propsWithOpenModal = {
            ...defaultProps,
            trialModalProps: {
                ...defaultProps.trialModalProps,
                upgradePlanModal: {
                    ...mockUpgradePlanModal,
                    isOpen: true,
                },
            },
        }

        render(<TrialSharedModals {...propsWithOpenModal} />)

        expect(screen.getByText('UpgradePlanModal - open')).toBeInTheDocument()
    })

    it('should not render UpgradePlanModal when closed', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(
            screen.queryByTestId('upgrade-plan-modal'),
        ).not.toBeInTheDocument()
    })

    it('should conditionally render TrialOptOutModal when open', () => {
        const propsWithOpenModal = {
            ...defaultProps,
            trialModalProps: {
                ...defaultProps.trialModalProps,
                trialOptOutModal: {
                    ...mockTrialOptOutModal,
                    isOpen: true,
                },
            },
        }

        render(<TrialSharedModals {...propsWithOpenModal} />)

        expect(screen.getByText('TrialOptOutModal - open')).toBeInTheDocument()
    })

    it('should not render TrialOptOutModal when closed', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(
            screen.queryByTestId('trial-opt-out-modal'),
        ).not.toBeInTheDocument()
    })

    it('should pass correct props to TrialFinishSetupModal', () => {
        render(<TrialSharedModals {...defaultProps} />)

        expect(
            screen.getByText('TrialFinishSetupModal - Finish Setup'),
        ).toBeInTheDocument()
    })

    it('should work with AI Agent trial type', () => {
        const aiAgentProps = {
            ...defaultProps,
            trialType: TrialType.AiAgent,
        }

        render(<TrialSharedModals {...aiAgentProps} />)

        expect(
            screen.getByText('TrialEndedModal - Test Shop - aiAgent'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('TrialEndingModal - Test Shop - aiAgent'),
        ).toBeInTheDocument()
    })
})
