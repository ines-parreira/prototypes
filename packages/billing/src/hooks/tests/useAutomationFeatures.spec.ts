import { renderHook } from '@repo/testing'

import {
    ARTICLE_RECOMMENDATION,
    FLOWS,
    ORDER_MANAGEMENT,
} from '../useAutomationFeatures'
import useAutomationFeatures from '../useAutomationFeatures'

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
                icon: 'account_tree',
                description: 'Build interactive, personalized resolutions',
            },
            {
                title: ORDER_MANAGEMENT,
                icon: 'shopping_cart',
                description: 'Let customers manage and track orders',
            },
            {
                title: ARTICLE_RECOMMENDATION,
                icon: 'menu_book',
                description: 'Answer customer questions with AI',
            },
            {
                title: 'Automation statistics',
                icon: 'bar_chart',
                description: 'Measure and track your automation performance',
            },
        ]

        expect(result.current).toEqual(expectedFeatures)
    })
})
