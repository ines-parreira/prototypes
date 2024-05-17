import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from '../useAiAgentNavigation'

describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AiAgentGuidance]: false,
        }))
    })
    it('should return headerNavbarItems with guidance and playground', () => {
        const {result} = renderHook(() =>
            useAiAgentNavigation({shopName: 'test'})
        )
        expect(result.current.headerNavbarItems).toEqual([
            {
                route: '/app/automation/shopify/test/ai-agent',
                title: 'Configuration',
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
        ])
    })

    it('should return headerNavbarItems with guidance and playground', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AiAgentGuidance]: true,
        }))

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
            },
            {
                route: '/app/automation/shopify/test/ai-agent/test',
                title: 'Test',
            },
        ])
    })
})
