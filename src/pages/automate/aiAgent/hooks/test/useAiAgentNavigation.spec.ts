import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useShowAutomateActions from 'pages/automate/actions/hooks/useShowAutomateActions'
import {assumeMock} from 'utils/testing'

import {useAiAgentNavigation} from '../useAiAgentNavigation'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlag: jest.fn(),
}))
const useFlagsMock = assumeMock(useFlags)

jest.mock('pages/automate/actions/hooks/useShowAutomateActions')
describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: false,
            [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
        })
    })

    it('should return headerNavbarItems with guidance and playground', () => {
        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
        ])
    })

    it('should add Actions to navbar if show automate actions is true', () => {
        ;(useShowAutomateActions as jest.Mock).mockReturnValue(true)

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                dataCanduId: 'ai-agent-navbar-actions',
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/actions',
                title: 'Actions',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
        ])
    })

    it('should add Knowledge to navbar if feature flag is on', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: true,
        })

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )

        expect(result.current.headerNavbarItems).toEqual(
            expect.arrayContaining([
                {
                    dataCanduId: 'ai-agent-navbar-knowledge',
                    route: '/app/automation/shopify/test/ai-agent/knowledge',
                    title: 'Knowledge',
                },
            ])
        )
    })

    it('should add Preview mode to navbar if user is impersonated and not in development mod', () => {
        window.USER_IMPERSONATED = true
        window.DEVELOPMENT = false

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/preview-mode',
                title: 'Preview',
            },
        ])
    })

    it('should not add Preview mode to navbar if user is not impersonated and not in development mode', () => {
        window.USER_IMPERSONATED = null
        window.DEVELOPMENT = false

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
        ])
    })

    it('should add Preview mode to navbar if in development mode and not impersonated', () => {
        window.USER_IMPERSONATED = null
        window.DEVELOPMENT = true

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/preview-mode',
                title: 'Preview',
            },
        ])
    })

    it('should add Preview mode to navbar if in development mode and impersonated', () => {
        window.USER_IMPERSONATED = true
        window.DEVELOPMENT = true

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/preview-mode',
                title: 'Preview',
            },
        ])
    })
})
