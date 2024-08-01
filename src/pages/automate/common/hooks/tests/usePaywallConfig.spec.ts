import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {assetsUrl} from 'utils'
import {FeatureFlagKey} from 'config/featureFlags'
import {PaywallFeature, usePaywallConfig} from '../usePaywallConfig'
import {AutomateFeatures} from '../../types'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('utils')

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const mockAssetsUrl = assetsUrl as jest.MockedFunction<typeof assetsUrl>

describe('usePaywallConfig', () => {
    beforeEach(() => {
        mockAssetsUrl.mockImplementation(
            (path: string) => `https://mockedurl.com${path}`
        )
    })

    it('should return the correct config for AutomateFeatures.Automate when SunsetQuickResponses:true', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: true,
        })
        const {result} = renderHook(() =>
            usePaywallConfig(AutomateFeatures.Automate)
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'Automate',
            paywallLogo:
                'https://mockedurl.com/img/self-service/automate-logo.svg',
            paywallLogoAlt: 'Gorgias Automate',
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
    it('should return the correct config for AutomateFeatures.Automate when SunsetQuickResponses:false', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: false,
        })
        const {result} = renderHook(() =>
            usePaywallConfig(AutomateFeatures.Automate)
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'Automate',
            paywallLogo:
                'https://mockedurl.com/img/self-service/automate-logo.svg',
            paywallLogoAlt: 'Gorgias Automate',
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
                        'Build personalized, automated interactions with Flows and Quick Responses.',
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
        const {result} = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AutomateStats)
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'Automate overview',
            paywallLogoAlt: 'Gorgias Automate',
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
                        'Build personalized, automated interactions with Flows and Quick Responses.',
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
        const {result} = renderHook(() =>
            usePaywallConfig(AutomateFeatures.AiAgent)
        )

        const expectedConfig: PaywallFeature = {
            headerTitle: 'Automate',
            paywallLogo: 'https://mockedurl.com/img/ai-agent/ai-agent-logo.png',
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
})
