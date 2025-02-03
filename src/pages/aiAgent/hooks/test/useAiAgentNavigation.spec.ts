import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useShowAutomateActions from 'pages/aiAgent/actions/hooks/useShowAutomateActions'
import {assumeMock} from 'utils/testing'

import {useAiAgentNavigation} from '../useAiAgentNavigation'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlag: jest.fn(),
}))
const useFlagsMock = assumeMock(useFlags)

jest.mock('pages/aiAgent/actions/hooks/useShowAutomateActions')
const useShowAutomateActionsMock = jest.mocked(useShowAutomateActions)

describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: false,
            [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            [FeatureFlagKey.ConvAiStandaloneMenu]: false,
        })
    })

    it('should return navigationItems with guidance and playground', () => {
        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
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
        useShowAutomateActionsMock.mockReturnValue(true)

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
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

        expect(result.current.navigationItems).toEqual(
            expect.arrayContaining([
                {
                    dataCanduId: 'ai-agent-navbar-knowledge',
                    route: '/app/automation/shopify/test/ai-agent/knowledge',
                    title: 'Knowledge',
                },
            ])
        )
    })

    it('should add Optimize to navbar if feature flag is on', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentOptimizeTab]: true,
        })

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )

        expect(result.current.navigationItems).toEqual(
            expect.arrayContaining([
                {
                    route: '/app/automation/shopify/test/ai-agent/optimize',
                    title: 'Optimize',
                    exact: false,
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
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
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
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
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
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
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
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
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

    it('should generate dynamic paths based on params', () => {
        window.USER_IMPERSONATED = true
        window.DEVELOPMENT = true

        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.routes.configuration('email')).toEqual(
            '/app/automation/shopify/test/ai-agent/settings?section=email'
        )
        expect(
            result.current.routes.newGuidanceTemplateArticle('templateId')
        ).toEqual(
            '/app/automation/shopify/test/ai-agent/guidance/templates/templateId'
        )
        expect(result.current.routes.editAction('configurationId')).toEqual(
            '/app/automation/shopify/test/ai-agent/actions/edit/configurationId'
        )
        expect(result.current.routes.optimizeIntent('intentId')).toEqual(
            '/app/automation/shopify/test/ai-agent/optimize/intentId'
        )
        expect(result.current.routes.actionEvents('configurationId')).toEqual(
            '/app/automation/shopify/test/ai-agent/actions/events/configurationId'
        )
    })

    it('should contain the overview page route', () => {
        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )

        expect(result.current.routes.overview).toBe('/app/ai-agent/overview')
    })

    describe('when ConvAiStandaloneMenu flag is true', () => {
        beforeEach(() => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.ConvAiStandaloneMenu]: true,
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
            })
        })

        it('should return /knowledge/guidance path', () => {
            const {result} = renderHook(() =>
                useAiAgentNavigation({shopName: 'test'})
            )
            expect(result.current.routes.guidance).toEqual(
                '/app/ai-agent/shopify/test/knowledge/guidance'
            )
        })

        it('should return /knowledge/actions path', () => {
            useShowAutomateActionsMock.mockReturnValue(true)

            const {result} = renderHook(() =>
                useAiAgentNavigation({shopName: 'test'})
            )
            expect(result.current.routes.actions).toEqual(
                '/app/ai-agent/shopify/test/knowledge/actions'
            )
        })

        it('should return /settings/preview path when user is a Gorgias user', () => {
            window.USER_IMPERSONATED = true

            const {result} = renderHook(() =>
                useAiAgentNavigation({shopName: 'test'})
            )

            expect(result.current.routes.previewMode).toEqual(
                '/app/ai-agent/shopify/test/settings/preview'
            )
        })
    })
})
