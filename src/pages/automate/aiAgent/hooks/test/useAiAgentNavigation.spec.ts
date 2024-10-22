import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useShowAutomateActions from 'pages/automate/actions/hooks/useShowAutomateActions'
import {assumeMock} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
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
            [FeatureFlagKey.AiAgentSnippetsFromExternalFiles]: false,
        })
    })

    it('should return headerNavbarItems with guidance and playground', () => {
        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Configuration',
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
                title: 'Configuration',
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
            [FeatureFlagKey.AiAgentSnippetsFromExternalFiles]: true,
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
})
