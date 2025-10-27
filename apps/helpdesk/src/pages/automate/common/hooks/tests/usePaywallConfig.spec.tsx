import { renderHook } from '@repo/testing'

import { THEME_NAME, useTheme } from 'core/theme'
import { assetsUrl } from 'utils'

import { AutomateFeatures } from '../../types'
import { PaywallFeature, usePaywallConfig } from '../usePaywallConfig'

jest.mock('utils')
jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))

const mockAssetsUrl = assetsUrl as jest.MockedFunction<typeof assetsUrl>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('usePaywallConfig', () => {
    beforeEach(() => {
        mockAssetsUrl.mockImplementation(
            (path: string) => `https://mockedurl.com${path}`,
        )
        mockUseTheme.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: {} as any,
        })
    })

    it('should return the correct config for AutomateFeatures.Automate', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.Automate),
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'AI Agent',
            paywallLogo:
                'https://mockedurl.com/img/self-service/automate-logo.svg',
            paywallLogoAlt: 'Gorgias AI Agent',
            paywallTitle:
                'Automate 60%+ of your support with AI and grow your brand',
            descriptions: [
                'Resolve email tickets in minutes with AI Agent.',
                'Boost CSAT with 24/7 support across channels.',
                'Save costs on support, especially during peak seasons.',
                'Save time to focus on high-impact tickets and CX strategy.',
            ],
            showRoiCalculator: true,
            slidesData: [
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_ai_agent.gif',
                    description:
                        "Upgrade your team with AI Agent to instantly answer tickets, perform actions and match your brand's voice.",
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_flows.png',
                    description:
                        'Build personalized, automated interactions with Flows.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_article_recommendation.png',
                    description: 'Recommend Help Center articles with AI.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_order_management.png',
                    description:
                        'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_statistics.png',
                    description:
                        'Track performance and improve your automations with dedicated statistics.',
                },
            ],
        }

        expect(result.current).toEqual(expectedConfig)
    })

    it('should return the correct config for AutomateFeatures.AutomateStats', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AutomateStats),
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'AI Agent overview',
            paywallLogoAlt: 'Gorgias AI Agent',
            paywallLogo:
                'https://mockedurl.com/img/self-service/automate-logo.svg',
            paywallTitle:
                'Instant resolutions for happier customers and a happier team',
            descriptions: [
                'Resolve up to 50% of requests with AI and automation.',
                'Save agent time for more personalized customer care.',
                'Save on costs while offering 24/7 support that scales.',
                'Automate email, Chat, Help Center, and Contact Form.',
            ],
            showRoiCalculator: true,
            slidesData: [
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_statistics.png',
                    description:
                        'Track performance and improve your automations with dedicated statistics.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_flows.png',
                    description:
                        'Build personalized, automated interactions with Flows.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_article_recommendation.png',
                    description: 'Recommend Help Center articles with AI.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_order_management.png',
                    description:
                        'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
                },
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/automate_paywall_autoresponders.png',
                    description:
                        'Leverage AI Autoresponders to reduce and resolve emails tickets.',
                },
            ],
        }

        expect(result.current).toEqual(expectedConfig)
    })

    it('should return the correct config for AutomateFeatures.AiAgent', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AiAgent),
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'AI Agent',
            paywallLogo: 'https://mockedurl.com/img/ai-agent/ai-agent-logo.svg',
            paywallLogoAlt: 'AI Agent',
            paywallTitle:
                'Introducing AI Agent for email, your team’s newest member for seamless customer support',
            descriptions: [
                'Deliver fast, relevant, accurate, and on-brand answers.',
                'Leverage your own knowledge base, data and integrations.',
                'Boost team productivity while reducing response times.',
                'Continuously improve based on your reviews & feedback.',
            ],
            showRoiCalculator: false,
            slidesData: [
                {
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/ai_agent_waitwall.gif',
                    description: '',
                },
            ],
        }

        expect(result.current).toEqual(expectedConfig)
    })

    it('should return the correct logo for AutomateFeatures.AiAgent in dark theme', () => {
        mockUseTheme.mockReturnValue({
            name: THEME_NAME.Dark,
            resolvedName: 'dark',
            tokens: {} as any,
        })

        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AiAgent),
        )

        expect(result.current.paywallLogo).toBe(
            'https://mockedurl.com/img/ai-agent/ai-agent-logo-white.svg',
        )
    })

    it('should return the correct config for AutomateFeatures.AutomateChat', () => {
        const customCta = <div role="button">My custom call to Action</div>
        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AutomateChat, customCta),
        )

        const expectedConfig: PaywallFeature = {
            customCta: <div role="button">My custom call to Action</div>,
            descriptions: [
                'Display Flows as interactive triggers on your Chat to proactively resolve top customer requests',
                'Allow customers to track and manage their orders directly within your Chat',
                'Automatically send Help Center articles to customer questions in Chat',
            ],
            headerTitle: '',
            hideLearnMore: true,
            paywallLogo: '',
            paywallLogoAlt: 'Gorgias Chat Preview',
            paywallTitle:
                'Connect a store to your Chat to use AI Agent features',
            showRoiCalculator: false,
            slidesData: [
                {
                    description: '',
                    imageUrl:
                        'https://mockedurl.com/img/paywalls/screens/chat-preview.png',
                },
            ],
        }
        expect(result.current).toMatchObject(expectedConfig)
    })

    it('should return the correct config for AutomateFeatures.AutomateContactForm', () => {
        const customCta = <div role="button">My custom call to Action</div>
        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AutomateContactForm, customCta),
        )
        const expectedConfig: PaywallFeature = {
            headerTitle: '',
            paywallLogo: '',
            paywallLogoAlt: 'Gorgias Contact Form Preview',
            paywallTitle:
                'Connect a Contact Form to your store to use AI Agent features',
            showRoiCalculator: false,
            hideLearnMore: true,
            descriptions: [
                'Display Flows as interactive triggers on your Contact Form to proactively resolve top customer requests',
                'Allow customers to track and manage their orders directly within your Contact Form',
            ],
            customCta,
            slidesData: [
                {
                    imageUrl: assetsUrl(
                        '/img/paywalls/screens/contact-form-preview.png',
                    ),
                    description: '',
                },
            ],
        }
        expect(result.current).toEqual(expectedConfig)
    })

    it('should return the correct config for AutomateFeatures.AutomateHelpCenter', () => {
        const customCta = <div role="button">My custom call to Action</div>
        const { result } = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AutomateHelpCenter, customCta),
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: '',
            paywallLogo: '',
            paywallLogoAlt: 'Gorgias Help Center Preview',
            paywallTitle:
                'Connect a Help Center to your store to use AI Agent features',
            showRoiCalculator: false,
            hideLearnMore: true,
            descriptions: [
                'Display Flows as interactive triggers on your Help Center to proactively resolve top customer requests',
                'Allow customers to track and manage their orders directly within your Help Center',
            ],
            customCta,
            slidesData: [
                {
                    imageUrl: assetsUrl(
                        '/img/paywalls/screens/help-center-preview.png',
                    ),
                    description: '',
                },
            ],
        }

        expect(result.current).toEqual(expectedConfig)
    })
})
