import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// Import mocked modules
import useAppSelector from 'hooks/useAppSelector'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getAutomateEarlyAccessPricesFormatted } from 'models/billing/utils'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'

import { TrialManageWorkflow } from '../components/TrialManageWorkflow/TrialManageWorkflow'

// Mock all the hooks and components
jest.mock('hooks/useAppSelector')
jest.mock('models/billing/queries')
jest.mock('models/billing/utils')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner')
jest.mock('pages/aiAgent/trial/components/TrialManageModal/TrialManageModal')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('pages/settings/new_billing/utils/formatAmount')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')

describe('TrialManageWorkflow', () => {
    const mockOpenManageTrialModal = jest.fn()
    const mockCloseManageTrialModal = jest.fn()
    const mockWindowOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock window.open
        global.window.open = mockWindowOpen

        // Default mock implementations
        ;(useAppSelector as jest.Mock).mockReturnValue({
            get: (key: string) => (key === 'domain' ? 'test-domain.com' : null),
        })
        ;(useBillingState as jest.Mock).mockReturnValue({
            data: {
                current_plans: {
                    automate: {
                        amount: 10000, // $100 in cents
                        currency: 'USD',
                    },
                    helpdesk: {
                        amount: 5000, // $50 in cents
                        num_quota_tickets: 100,
                        currency: 'USD',
                    },
                },
            },
        })
        ;(useEarlyAccessAutomatePlan as jest.Mock).mockReturnValue({
            data: {
                amount: 15000, // $150 in cents
                currency: 'USD',
            },
        })
        ;(getAutomateEarlyAccessPricesFormatted as jest.Mock).mockReturnValue({
            amount: '$150',
            amountAfterDiscount: '$150',
            discount: 0,
        })
        ;(formatAmount as jest.Mock).mockImplementation((amount) => {
            return `$${amount}`
        })
        ;(useStoreActivations as jest.Mock).mockReturnValue({
            storeActivations: ['store1', 'store2'],
        })
        ;(useTrialMetrics as jest.Mock).mockReturnValue({
            gmv: 25,
            remainingDays: 5,
            isLoading: false,
        })
        ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
            canSeeTrialStartedBanner: false,
            canBookDemo: false,
        })
        ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
            openManageTrialModal: mockOpenManageTrialModal,
            isManageTrialModalOpen: false,
            closeManageTrialModal: mockCloseManageTrialModal,
        })
        ;(useUpgradePlan as jest.Mock).mockReturnValue({
            upgradePlan: jest.fn(),
            upgradePlanAsync: jest.fn(),
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })

        // Mock components to render test content
        ;(TrialAlertBanner as jest.Mock).mockImplementation((props: any) => (
            <div data-testid="trial-alert-banner">
                <button onClick={props.primaryAction.onClick}>
                    {props.primaryAction.label}
                </button>
                <button onClick={props.secondaryAction.onClick}>
                    {props.secondaryAction.label}
                </button>
            </div>
        ))
        ;(TrialManageModal as jest.Mock).mockImplementation((props: any) => (
            <div data-testid="trial-manage-modal">
                <h2>{props.title}</h2>
                <p>{props.description}</p>
                <button onClick={props.primaryAction.onClick}>
                    {props.primaryAction.label}
                </button>
                <button onClick={props.secondaryAction.onClick}>
                    {props.secondaryAction.label}
                </button>
            </div>
        ))
    })

    it('does not render any components when user cannot see trial banner', () => {
        render(<TrialManageWorkflow />)

        expect(
            screen.queryByTestId('trial-alert-banner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('trial-manage-modal'),
        ).not.toBeInTheDocument()
    })

    describe('when user can see trial banner', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                canSeeTrialStartedBanner: true,
                canBookDemo: false,
            })
        })

        it('renders TrialAlertBanner', () => {
            render(<TrialManageWorkflow />)

            expect(screen.getByTestId('trial-alert-banner')).toBeInTheDocument()
        })

        it('shows "Book a demo" as primary action when user can book demo', () => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                canSeeTrialStartedBanner: true,
                canBookDemo: true,
            })

            render(<TrialManageWorkflow />)

            expect(screen.getByText('Book a demo')).toBeInTheDocument()
        })

        it('opens demo link in new tab when "Book a demo" is clicked', async () => {
            ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
                canSeeTrialStartedBanner: true,
                canBookDemo: true,
            })

            const user = userEvent.setup()
            render(<TrialManageWorkflow />)

            const bookDemoButton = screen.getByText('Book a demo')
            await user.click(bookDemoButton)

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://www.gorgias.com/demo/customers/automate',
                '_blank',
            )
        })

        it('shows "Upgrade Now" as primary action when user cannot book demo', () => {
            render(<TrialManageWorkflow />)
            expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
        })

        it('does nothing when "Upgrade Now" is clicked', async () => {
            const user = userEvent.setup()
            render(<TrialManageWorkflow />)

            const upgradeButton = screen.getByText('Upgrade Now')
            await user.click(upgradeButton)

            // No specific action should occur
            expect(mockWindowOpen).not.toHaveBeenCalled()
        })

        it('opens manage trial modal when "Manage Trial" is clicked', async () => {
            const user = userEvent.setup()
            render(<TrialManageWorkflow />)

            const manageTrialButton = screen.getByText('Manage Trial')
            await user.click(manageTrialButton)

            expect(mockOpenManageTrialModal).toHaveBeenCalled()
        })
    })

    describe('when manage trial modal is open', () => {
        beforeEach(() => {
            ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
                openManageTrialModal: mockOpenManageTrialModal,
                isManageTrialModalOpen: true,
                closeManageTrialModal: mockCloseManageTrialModal,
            })
        })

        it('renders TrialManageModal', () => {
            render(<TrialManageWorkflow />)
            expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        })

        it('displays correct title and description with GMV metrics', () => {
            render(<TrialManageWorkflow />)

            expect(
                screen.getByText('Manage Shopping Assistant trial'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Shopping Assistant boosted your GMV by \+25 during the trial/,
                ),
            ).toBeInTheDocument()
        })

        it('displays GMV metric in advantages', () => {
            render(<TrialManageWorkflow />)

            expect(TrialManageModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    advantages: ['25 GMV uplift'],
                }),
                expect.anything(),
            )
        })

        it('closes modal when "Opt Out" is clicked', async () => {
            const user = userEvent.setup()
            render(<TrialManageWorkflow />)

            const optOutButton = screen.getByText('Opt Out')
            await user.click(optOutButton)

            expect(mockCloseManageTrialModal).toHaveBeenCalled()
        })

        it('closes modal when onClose is triggered', async () => {
            ;(TrialManageModal as jest.Mock).mockImplementation(
                (props: any) => (
                    <div data-testid="trial-manage-modal">
                        <button onClick={props.onClose}>Close</button>
                    </div>
                ),
            )

            const user = userEvent.setup()
            render(<TrialManageWorkflow />)

            const closeButton = screen.getByText('Close')
            await user.click(closeButton)

            expect(mockCloseManageTrialModal).toHaveBeenCalled()
        })
    })

    it('passes correct parameters to useShoppingAssistantTrialFlow', () => {
        render(<TrialManageWorkflow />)

        expect(useShoppingAssistantTrialFlow).toHaveBeenCalledWith({
            accountDomain: 'test-domain.com',
            storeActivations: ['store1', 'store2'],
        })
    })

    it('passes correct props to TrialAlertBanner', () => {
        ;(useShoppingAssistantTrialAccess as jest.Mock).mockReturnValue({
            canSeeTrialStartedBanner: true,
            canBookDemo: false,
        })

        render(<TrialManageWorkflow />)

        expect(TrialAlertBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Shopping Assistant trial ends in 5 days.',
                description:
                    "So far, it's generated 25 in added GMV for your store.",
                primaryAction: {
                    label: 'Upgrade Now',
                    onClick: expect.any(Function),
                    isLoading: false,
                },
                secondaryAction: {
                    label: 'Manage Trial',
                    onClick: expect.any(Function),
                },
            }),
            expect.anything(),
        )
    })

    it('passes correct props to TrialManageModal', () => {
        ;(useShoppingAssistantTrialFlow as jest.Mock).mockReturnValue({
            openManageTrialModal: mockOpenManageTrialModal,
            isManageTrialModalOpen: true,
            closeManageTrialModal: mockCloseManageTrialModal,
        })

        render(<TrialManageWorkflow />)

        const call = (TrialManageModal as jest.Mock).mock.calls[0]
        expect(call[0].title).toBe('Manage Shopping Assistant trial')
        expect(call[0].description).toBe(
            'Shopping Assistant boosted your GMV by +25 during the trial. Keep the momentum going and turn even more visitors into buyers.',
        )
        expect(call[0].advantages).toEqual(['25 GMV uplift'])
        expect(call[0].onClose).toBe(mockCloseManageTrialModal)
        expect(call[0].primaryAction.label).toBe('Upgrade Now')
        expect(typeof call[0].primaryAction.onClick).toBe('function')
        expect(call[0].secondaryAction.label).toBe('Opt Out')
        expect(typeof call[0].secondaryAction.onClick).toBe('function')
    })
})
