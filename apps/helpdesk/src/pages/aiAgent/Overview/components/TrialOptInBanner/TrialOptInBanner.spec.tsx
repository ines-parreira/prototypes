import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialOptInBanner } from 'pages/aiAgent/Overview/components/TrialOptInBanner/TrialOptInBanner'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')

const mockUseShoppingAssistantTrialFlow =
    useShoppingAssistantTrialFlow as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock

const SHOP_NAME = 'my-shop'

const baseTrialFlow = {
    openTrialUpgradeModal: jest.fn(),
}

const baseTrialAccess = {
    trialType: TrialType.AiAgent,
}

const renderBanner = (
    props: Partial<ComponentProps<typeof TrialOptInBanner>> = {},
) =>
    render(
        <TrialOptInBanner
            shopName={SHOP_NAME}
            storeActivations={{}}
            {...props}
        />,
    )

describe('<TrialOptInBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)
        mockUseShoppingAssistantTrialFlow.mockReturnValue(baseTrialFlow)
    })

    it('renders banner with Start trial CTA', () => {
        renderBanner()

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

        renderBanner()

        await user.click(screen.getByRole('button', { name: /Start trial/i }))

        expect(openTrialUpgradeModal).toHaveBeenCalledTimes(1)
    })

    it('describes the trial for the ShoppingAssistant trial type', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            trialType: TrialType.ShoppingAssistant,
        })

        renderBanner()

        expect(
            screen.getByText(/let AI Agent respond to your customers/i),
        ).toBeInTheDocument()
    })
})
