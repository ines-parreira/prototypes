import {renderHook} from '@testing-library/react-hooks'
import useShowAutomateActions from 'pages/automate/actions/hooks/useShowAutomateActions'
import {useAiAgentNavigation} from '../useAiAgentNavigation'

jest.mock('pages/automate/actions/hooks/useShowAutomateActions')
describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks()
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
})
