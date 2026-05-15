import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { THEME_NAME, useTheme } from 'core/theme'
import { AIAgentWelcomePageViewV3 } from 'pages/aiAgent/components/AIAgentWelcomePageViewV3/AIAgentWelcomePageViewV3'
import { useAiAgentWelcomePageV3SideEffects } from 'pages/aiAgent/components/AIAgentWelcomePageViewV3/useAiAgentWelcomePageV3SideEffects'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { AutomatePaywallVisited: 'automate-paywall-visited' },
}))
jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/components/AIAgentWelcomePageViewV3/useAiAgentWelcomePageV3SideEffects',
    () => ({
        useAiAgentWelcomePageV3SideEffects: jest.fn(),
    }),
)

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockUseSideEffects =
    useAiAgentWelcomePageV3SideEffects as jest.MockedFunction<
        typeof useAiAgentWelcomePageV3SideEffects
    >

const SHOP_NAME = 'my-shop'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

describe('<AIAgentWelcomePageViewV3 />', () => {
    const mockOnCtaTransition = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTheme.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: {} as never,
        })
        mockUseSideEffects.mockReturnValue({
            onCtaTransition: mockOnCtaTransition,
            isOnUpdateOnboardingWizard: false,
        })
    })

    const renderComponent = (
        storeConfiguration?: object,
        sideEffectsOverrides?: Partial<
            ReturnType<typeof useAiAgentWelcomePageV3SideEffects>
        >,
    ) => {
        if (sideEffectsOverrides) {
            mockUseSideEffects.mockReturnValue({
                onCtaTransition: mockOnCtaTransition,
                isOnUpdateOnboardingWizard: false,
                ...sideEffectsOverrides,
            })
        }
        return render(
            <AIAgentWelcomePageViewV3
                shopName={SHOP_NAME}
                storeConfiguration={storeConfiguration as never}
            />,
        )
    }

    it('renders the trial-setup content with the Start setup CTA', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: /Help shoppers browse, buy, and get support/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Define how it responds to specific topics/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Your 2-week trial starts only when AI Agent/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Start setup/i }),
        ).toBeInTheDocument()
    })

    it('logs the AutomatePaywallVisited event on mount', () => {
        renderComponent()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallVisited,
            { location: AIAgentPaywallFeatures.TrialSetup },
        )
    })

    it.each([
        {
            label: 'support',
            optionName: /Resolve support questions automatically/i,
        },
        {
            label: 'sales',
            optionName: /Turn shopper conversations into sales/i,
        },
    ])(
        'invokes the CTA transition with jtbd=$label after picking $label',
        async ({ label, optionName }) => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /Start setup/i }),
            )
            await user.click(screen.getByText(optionName))

            expect(mockOnCtaTransition).toHaveBeenCalledWith({ jtbd: label })
        },
    )

    it('exposes the Candu anchor on the Start setup button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /Start setup/i }),
        ).toHaveAttribute('data-candu-id', 'ai-agent-welcome-page')
    })

    it('swaps the CTA label to Continue setup when the wizard has not yet been completed', () => {
        renderComponent(
            { wizard: { completedDatetime: null } },
            { isOnUpdateOnboardingWizard: true },
        )

        expect(
            screen.getByRole('button', { name: /Continue setup/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /^Start setup$/i }),
        ).not.toBeInTheDocument()
    })

    it('toggles the preview between Support and Sales', async () => {
        const user = userEvent.setup()
        const { container } = renderComponent()

        const supportRadio = screen.getByRole('radio', { name: /Support/i })
        const salesRadio = screen.getByRole('radio', { name: /Sales/i })

        expect(supportRadio).toHaveAttribute('aria-checked', 'true')
        expect(container.querySelector('video')).toBeInTheDocument()

        await user.click(salesRadio)

        expect(salesRadio).toHaveAttribute('aria-checked', 'true')
        expect(container.querySelector('video')).not.toBeInTheDocument()
    })
})
