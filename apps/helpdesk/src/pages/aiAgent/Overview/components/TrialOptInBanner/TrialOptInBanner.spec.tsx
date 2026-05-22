import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialOptInBanner } from 'pages/aiAgent/Overview/components/TrialOptInBanner/TrialOptInBanner'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: () => ({ storeActivations: {} }),
}))
jest.mock('pages/aiAgent/trial/components/TrialActivationModal', () => ({
    TrialActivationModal: ({
        isOpen,
        trialType,
        onConfirm,
        onClose,
    }: {
        isOpen: boolean
        trialType: TrialType
        onConfirm: (optedInForUpgrade?: boolean) => void
        onClose: () => void
    }) =>
        isOpen ? (
            <div role="dialog" aria-label="Trial activation">
                <span data-trial-type>{trialType}</span>
                <button onClick={() => onConfirm(true)}>Confirm trial</button>
                <button onClick={onClose}>Dismiss trial</button>
            </div>
        ) : null,
}))
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
const mockUseTrialAccess = useTrialAccess as jest.Mock

const SHOP_NAME = 'my-shop'

const baseTrialFlow = {
    startTrial: jest.fn(),
    isLoading: false,
    isTrialModalOpen: false,
    isSuccessModalOpen: false,
    closeTrialUpgradeModal: jest.fn(),
    closeSuccessModal: jest.fn(),
    openTrialUpgradeModal: jest.fn(),
}

const baseTrialAccess = {
    trialType: TrialType.AiAgent,
}

describe('<TrialOptInBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)
        mockUseTrialModalProps.mockReturnValue({
            newTrialUpgradePlanModal: { newPlan: {} },
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

    it('opens the activation modal when Start trial is clicked', async () => {
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

    it('mounts the activation modal when isTrialModalOpen is true', () => {
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isTrialModalOpen: true,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('dialog', { name: /Trial activation/i }),
        ).toBeInTheDocument()
    })

    it('passes the AiAgent trialType to the activation modal when trialAccess reports AiAgent', () => {
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isTrialModalOpen: true,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('dialog', { name: /Trial activation/i }),
        ).toHaveTextContent(TrialType.AiAgent)
    })

    it('passes the ShoppingAssistant trialType to the activation modal when trialAccess reports ShoppingAssistant', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            trialType: TrialType.ShoppingAssistant,
        })
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isTrialModalOpen: true,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('dialog', { name: /Trial activation/i }),
        ).toHaveTextContent(TrialType.ShoppingAssistant)
    })

    it('dispatches startTrial from the trial flow when the user confirms', async () => {
        const user = userEvent.setup()
        const startTrial = jest.fn()
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isTrialModalOpen: true,
            startTrial,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        await user.click(screen.getByRole('button', { name: /Confirm trial/i }))

        expect(startTrial).toHaveBeenCalledTimes(1)
        expect(startTrial).toHaveBeenCalledWith(true)
    })

    it('closes the activation modal when the user dismisses', async () => {
        const user = userEvent.setup()
        const closeTrialUpgradeModal = jest.fn()
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            ...baseTrialFlow,
            isTrialModalOpen: true,
            closeTrialUpgradeModal,
        })

        render(<TrialOptInBanner shopName={SHOP_NAME} />)

        await user.click(screen.getByRole('button', { name: /Dismiss trial/i }))

        expect(closeTrialUpgradeModal).toHaveBeenCalledTimes(1)
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
