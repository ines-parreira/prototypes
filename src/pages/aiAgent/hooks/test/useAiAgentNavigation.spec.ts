import { renderHook } from '@testing-library/react-hooks'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { assumeMock } from 'utils/testing'

import { useAiAgentNavigation } from '../useAiAgentNavigation'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlag: jest.fn(),
}))
const useFlagsMock = assumeMock(useFlags)

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
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
                dataCanduId: 'ai-agent-navbar-guidance',
                exact: false,
            },
            {
                route: '/app/automation/shopify/test/ai-agent/actions',
                title: 'Actions',
                exact: false,
                dataCanduId: 'ai-agent-navbar-actions',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/sales',
                title: 'Sales Skills',
                dataCanduId: 'ai-agent-navbar-sales',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
                dataCanduId: 'ai-agent-navbar-test',
            },
        ])
    })

    it('should add Knowledge to navbar if feature flag is on', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: true,
        })

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.navigationItems).toEqual(
            expect.arrayContaining([
                {
                    route: '/app/automation/shopify/test/ai-agent/knowledge',
                    title: 'Knowledge',
                    dataCanduId: 'ai-agent-navbar-knowledge',
                },
            ]),
        )
    })

    it('should add Optimize to navbar if feature flag is on', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentOptimizeTab]: true,
        })

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.navigationItems).toEqual(
            expect.arrayContaining([
                {
                    route: '/app/automation/shopify/test/ai-agent/optimize',
                    title: 'Optimize',
                    dataCanduId: 'ai-agent-navbar-optimize',
                    exact: false,
                },
            ]),
        )
    })

    it('should add Preview mode to navbar if user is impersonated and not in development mod', () => {
        window.USER_IMPERSONATED = true
        window.DEVELOPMENT = false

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
                dataCanduId: 'ai-agent-navbar-guidance',
                exact: false,
            },
            {
                route: '/app/automation/shopify/test/ai-agent/actions',
                title: 'Actions',
                exact: false,
                dataCanduId: 'ai-agent-navbar-actions',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/sales',
                title: 'Sales Skills',
                dataCanduId: 'ai-agent-navbar-sales',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
                dataCanduId: 'ai-agent-navbar-test',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/preview-mode',
                title: 'Preview',
                dataCanduId: 'ai-agent-navbar-preview',
            },
        ])
    })

    it('should not add Preview mode to navbar if user is not impersonated and not in development mode', () => {
        window.USER_IMPERSONATED = null
        window.DEVELOPMENT = false

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.navigationItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent/settings',
                title: 'Settings',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
                dataCanduId: 'ai-agent-navbar-guidance',
                exact: false,
            },
            {
                route: '/app/automation/shopify/test/ai-agent/actions',
                title: 'Actions',
                exact: false,
                dataCanduId: 'ai-agent-navbar-actions',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/sales',
                title: 'Sales Skills',
                dataCanduId: 'ai-agent-navbar-sales',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                dataCanduId: 'ai-agent-navbar-test',
                title: 'Test',
            },
        ])
    })

    it('should add Preview mode to navbar if in development mode and not impersonated', () => {
        window.USER_IMPERSONATED = null
        window.DEVELOPMENT = true

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.navigationItems).toEqual(
            expect.arrayContaining([
                {
                    route: '/app/automation/shopify/test/ai-agent/settings',
                    title: 'Settings',
                    dataCanduId: 'ai-agent-navbar-configuration',
                },
                {
                    exact: false,
                    route: '/app/automation/shopify/test/ai-agent/guidance',
                    title: 'Guidance',
                    dataCanduId: 'ai-agent-navbar-guidance',
                },
                {
                    route: '/app/automation/shopify/test/ai-agent/test',
                    title: 'Test',
                    dataCanduId: 'ai-agent-navbar-test',
                },
                {
                    route: '/app/automation/shopify/test/ai-agent/preview-mode',
                    title: 'Preview',
                    dataCanduId: 'ai-agent-navbar-preview',
                },
            ]),
        )
    })

    it('should add Preview mode to navbar if in development mode and impersonated', () => {
        window.USER_IMPERSONATED = true
        window.DEVELOPMENT = true

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.navigationItems).toEqual(
            expect.arrayContaining([
                {
                    route: '/app/automation/shopify/test/ai-agent/settings',
                    title: 'Settings',
                    dataCanduId: 'ai-agent-navbar-configuration',
                },
                {
                    exact: false,
                    route: '/app/automation/shopify/test/ai-agent/guidance',
                    dataCanduId: 'ai-agent-navbar-guidance',
                    title: 'Guidance',
                },
                {
                    route: '/app/automation/shopify/test/ai-agent/test',
                    dataCanduId: 'ai-agent-navbar-test',
                    title: 'Test',
                },
                {
                    route: '/app/automation/shopify/test/ai-agent/preview-mode',
                    title: 'Preview',
                    dataCanduId: 'ai-agent-navbar-preview',
                },
            ]),
        )
    })

    it('should generate dynamic paths based on params', () => {
        window.USER_IMPERSONATED = true
        window.DEVELOPMENT = true

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.configuration('email')).toEqual(
            '/app/automation/shopify/test/ai-agent/settings?section=email',
        )
        expect(
            result.current.routes.newGuidanceTemplateArticle('templateId'),
        ).toEqual(
            '/app/automation/shopify/test/ai-agent/guidance/templates/templateId',
        )
        expect(result.current.routes.editAction('configurationId')).toEqual(
            '/app/automation/shopify/test/ai-agent/actions/edit/configurationId',
        )
        expect(result.current.routes.optimizeIntent('intentId')).toEqual(
            '/app/automation/shopify/test/ai-agent/optimize/intentId',
        )
        expect(result.current.routes.actionEvents('configurationId')).toEqual(
            '/app/automation/shopify/test/ai-agent/actions/events/configurationId',
        )
    })

    it('should contain the overview page route', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.overview).toBe('/app/ai-agent/overview')
    })

    describe('when ConvAiStandaloneMenu flag is true', () => {
        beforeEach(() => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.ConvAiStandaloneMenu]: true,
                [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
                [FeatureFlagKey.StandaloneAIAgentSalesPage]: true,
            })
        })

        it('should return /knowledge/guidance path', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test' }),
            )
            expect(result.current.routes.guidance).toEqual(
                '/app/ai-agent/shopify/test/knowledge/guidance',
            )
        })

        it('should return /settings/preview path when user is a Gorgias user', () => {
            window.USER_IMPERSONATED = true

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test' }),
            )

            expect(result.current.routes.previewMode).toEqual(
                '/app/ai-agent/shopify/test/settings/preview',
            )
        })

        it('should return /sales path when user is a Gorgias user', () => {
            window.USER_IMPERSONATED = true

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test' }),
            )

            expect(result.current.routes.sales).toEqual(
                '/app/ai-agent/shopify/test/sales',
            )
        })

        it('should return /actions/new?template_id=1 path', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test' }),
            )

            expect(result.current.routes.newAction('1')).toEqual(
                '/app/ai-agent/shopify/test/actions/new?template_id=1',
            )
        })
    })
})
