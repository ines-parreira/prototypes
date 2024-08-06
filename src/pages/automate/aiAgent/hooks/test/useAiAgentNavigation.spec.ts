import {renderHook} from '@testing-library/react-hooks'
import {useAiAgentNavigation} from '../useAiAgentNavigation'

describe('useAiAgentNavigation', () => {
    it('should return headerNavbarItems with guidance and playground', () => {
        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                exact: false,
                route: '/app/automation/shopify/test/ai-agent/guidance',
                title: 'Guidance',
            },
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Configuration',
                dataCanduId: 'ai-agent-navbar-configuration',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
        ])
    })
})
