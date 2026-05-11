import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'

import { THEME_NAME, useTheme } from 'core/theme'
import { V3AdminPaywall } from 'pages/aiAgent/components/V3AdminPaywall/V3AdminPaywall'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { AutomatePaywallVisited: 'automate-paywall-visited' },
}))
jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

const SHOP_NAME = 'my-shop'

const LocationPath = () => {
    const location = useLocation()
    return <div>{`${location.pathname}${location.search}`}</div>
}

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

describe('<V3AdminPaywall />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTheme.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: {} as never,
        })
        mockUseAiAgentNavigation.mockImplementation(({ shopName }) => ({
            routes: {
                onboardingWizardStep: (step: string) =>
                    `/app/ai-agent/shopify/${shopName}/onboarding/${step}`,
            },
        }))
    })

    it('renders the trial-setup content with the Start setup CTA', () => {
        render(<V3AdminPaywall shopName={SHOP_NAME} />)

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
        render(<V3AdminPaywall shopName={SHOP_NAME} />)

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
        'navigates to onboarding with ?jtbd=$label after picking $label',
        async ({ label, optionName }) => {
            const user = userEvent.setup()
            render(
                <>
                    <V3AdminPaywall shopName={SHOP_NAME} />
                    <LocationPath />
                </>,
            )

            await user.click(
                screen.getByRole('button', { name: /Start setup/i }),
            )
            await user.click(screen.getByText(optionName))

            expect(
                screen.getByText(
                    `/app/ai-agent/shopify/${SHOP_NAME}/onboarding/tone of voice?jtbd=${label}`,
                ),
            ).toBeInTheDocument()
        },
    )

    it('falls back to the unscoped onboarding route when there is no shop', async () => {
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                onboardingWizardStep: jest.fn(),
            },
        })

        const user = userEvent.setup()
        render(
            <>
                <V3AdminPaywall shopName={undefined} />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('button', { name: /Start setup/i }))
        await user.click(
            screen.getByText(/Resolve support questions automatically/i),
        )

        expect(
            screen.getByText(
                '/app/ai-agent/onboarding/tone of voice?jtbd=support',
            ),
        ).toBeInTheDocument()
    })

    it('toggles the preview between Support and Sales', async () => {
        const user = userEvent.setup()
        const { container } = render(<V3AdminPaywall shopName={SHOP_NAME} />)

        const supportRadio = screen.getByRole('radio', { name: /Support/i })
        const salesRadio = screen.getByRole('radio', { name: /Sales/i })

        expect(supportRadio).toHaveAttribute('aria-checked', 'true')
        expect(container.querySelector('video')).toBeInTheDocument()

        await user.click(salesRadio)

        expect(salesRadio).toHaveAttribute('aria-checked', 'true')
        expect(container.querySelector('video')).not.toBeInTheDocument()
    })
})
