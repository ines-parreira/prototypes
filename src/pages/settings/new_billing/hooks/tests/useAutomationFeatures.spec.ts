import {
    ARTICLE_RECOMMENDATION,
    FLOWS,
    ORDER_MANAGEMENT,
} from 'pages/automate/common/components/constants'
import { renderHook } from 'utils/testing/renderHook'

import useAutomationFeatures from '../useAutomationFeatures'

jest.mock('launchdarkly-react-client-sdk')

describe('useAutomationFeatures', () => {
    it('should return features including AI Agent', () => {
        const { result } = renderHook(() => useAutomationFeatures())

        const expectedFeatures = [
            {
                title: 'AI Agent',
                icon: 'auto_awesome',
                description: 'Your virtual agent for automated support',
            },
            {
                title: FLOWS,
                iconUrl: 'test-file-stub',
                description: 'Build interactive, personalized resolutions',
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
                title: 'Automate statistics',
                icon: 'bar_chart',
                description: 'Measure and track your automation performance',
            },
        ]

        expect(result.current).toEqual(expectedFeatures)
    })
})
