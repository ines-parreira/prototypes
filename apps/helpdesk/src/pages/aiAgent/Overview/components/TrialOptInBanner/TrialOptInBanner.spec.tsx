import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TrialOptInBanner } from 'pages/aiAgent/Overview/components/TrialOptInBanner/TrialOptInBanner'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: () => ({ storeActivations: {} }),
}))
jest.mock(
    'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal',
    () => ({
        UpgradePlanModal: () => <div role="dialog" aria-label="Upgrade plan" />,
    }),
)
jest.mock(
    'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal',
    () => ({
        TrialActivatedModal: () => (
            <div role="dialog" aria-label="Trial activated" />
        ),
    }),
)

const mockUseShoppingAssistantTrialFlow =
    useShoppingAssistantTrialFlow as jest.Mock
const mockUseTrialModalProps = useTrialModalProps as jest.Mock

const SHOP_NAME = 'my-shop'

const baseTrialFlow = {
    startTrialDeprecated: jest.fn(),
    isLoading: false,
    isTrialModalOpen: false,
    isSuccessModalOpen: false,
    closeTrialUpgradeModal: jest.fn(),
    closeSuccessModal: jest.fn(),
    onConfirmTrial: jest.fn(),
    onDismissTrialUpgradeModal: jest.fn(),
    openTrialUpgradeModal: jest.fn(),
}

describe('<TrialOptInBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTrialModalProps.mockReturnValue({
            trialUpgradePlanModal: {},
            trialActivatedModal: {},
        })
        mockUseShoppingAssistantTrialFlow.mockReturnValue(baseTrialFlow)
    })

    it('renders banner with Start trial CTA', () => {
        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        expect(screen.getByText(/AI Agent is ready/i)).toBeInTheDocument()
        expect(screen.getByText(/Start your 2-week trial/i)).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Start trial/i }),
        ).toBeInTheDocument()
    })

    it('opens the trial upgrade modal when Start trial is clicked', async () => {
        const user = userEvent.setup()
        const openTrialUpgradeModal = jest.fn()

        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            openTrialUpgradeModal,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        await user.click(screen.getByRole('button', { name: /Start trial/i }))

        expect(openTrialUpgradeModal).toHaveBeenCalledTimes(1)
    })

    it('mounts the upgrade modal when isTrialModalOpen is true', () => {
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isTrialModalOpen: true,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('dialog', { name: /Upgrade plan/i }),
        ).toBeInTheDocument()
    })

    it('mounts the trial activated modal when isSuccessModalOpen is true', () => {
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isSuccessModalOpen: true,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('dialog', { name: /Trial activated/i }),
        ).toBeInTheDocument()
    })
})
