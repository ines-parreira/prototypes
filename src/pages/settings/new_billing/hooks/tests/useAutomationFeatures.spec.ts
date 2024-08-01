import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    FLOWS,
    ORDER_MANAGEMENT,
    ARTICLE_RECOMMENDATION,
    QUICK_RESPONSES,
} from 'pages/automate/common/components/constants'
import {FeatureFlagKey} from 'config/featureFlags'
import useAutomationFeatures from '../useAutomationFeatures'

jest.mock('launchdarkly-react-client-sdk')

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('useAutomationFeatures', () => {
    it('should return features including AI Agent when sunsetQuickResponses is true', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: true,
        })
        const {result} = renderHook(() => useAutomationFeatures())

        const expectedFeatures = [
            {
                title: 'AI Agent',
                icon: 'auto_awesome',
                disabled: false,
                description: 'Your virtual agent for automatic support',
            },
            {
                title: FLOWS,
                iconUrl: 'test-file-stub',
                description: 'Build interactive, personalized resolutions',
            },
            {
                title: QUICK_RESPONSES,
                icon: 'chat',
                disabled: true,
                description: 'Provide instant resolutions to FAQs',
            },
            {
                title: ORDER_MANAGEMENT,
                iconUrl: 'test-file-stub',
                description: 'Let customers manage and track orders',
            },
            {
                title: ARTICLE_RECOMMENDATION,
                icon: 'menu_book',
                description: 'Answer customer questions with AI',
            },
            {
                title: 'Autoresponders',
                icon: 'email',
                description: 'Filter and resolve email requests with AI',
            },
            {
                title: 'Automate statistics',
                icon: 'bar_chart',
                description: 'Measure and track your automation performance',
            },
        ]

        expect(result.current).toEqual(expectedFeatures)
    })

    it('should return features including Quick Responses when sunsetQuickResponses is false', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: false,
        })
        const {result} = renderHook(() => useAutomationFeatures())

        const expectedFeatures = [
            {
                title: 'AI Agent',
                icon: 'auto_awesome',
                disabled: true,
                description: 'Your virtual agent for automatic support',
            },
            {
                description: 'Build interactive, personalized resolutions',
                iconUrl: 'test-file-stub',
                title: FLOWS,
            },
            {
                title: QUICK_RESPONSES,
                icon: 'chat',
                disabled: false,
                description: 'Provide instant resolutions to FAQs',
            },
            {
                title: ORDER_MANAGEMENT,
                iconUrl: 'test-file-stub',
                description: 'Let customers manage and track orders',
            },
            {
                title: ARTICLE_RECOMMENDATION,
                icon: 'menu_book',
                description: 'Answer customer questions with AI',
            },
            {
                title: 'Autoresponders',
                icon: 'email',
                description: 'Filter and resolve email requests with AI',
            },
            {
                title: 'Automate statistics',
                icon: 'bar_chart',
                description: 'Measure and track your automation performance',
            },
        ]

        expect(result.current).toEqual(expectedFeatures)
    })
})
