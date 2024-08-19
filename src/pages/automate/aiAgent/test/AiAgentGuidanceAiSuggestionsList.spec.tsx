import React from 'react'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {renderWithRouter} from 'utils/testing'
import history from 'pages/history'
import {GuidanceAiSuggestionsList} from '../components/GuidanceAiSuggestionsList/GuidanceAiSuggestionsList'
import {getAIGuidanceFixture} from '../fixtures/aiGuidance.fixture'

jest.mock('pages/history')

const renderComponent = (
    params: React.ComponentProps<typeof GuidanceAiSuggestionsList>
) => {
    renderWithRouter(<GuidanceAiSuggestionsList {...params} />, {
        path: `/:shopType/:shopName/ai-agent/guidance/templates`,
        route: '/shopify/test-shop/ai-agent/guidance/templates',
    })
}
describe('<GuidanceAiSuggestionsList />', () => {
    it('should return null if no guidance ai suggestions and no banner', () => {
        renderComponent({guidanceAiSuggestions: [], shopName: 'test'})
        expect(
            screen.queryByText('See All Suggestions')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'You’ve added all AI-generated suggestions to your library.'
            )
        ).not.toBeInTheDocument()
    })

    it('should render ai guidance suggestions', () => {
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')

        renderComponent({guidanceAiSuggestions: [aiGuidance], shopName: 'test'})

        expect(screen.getByText(aiGuidance.name)).toBeInTheDocument()
        expect(
            screen.queryByText('See All Suggestions')
        ).not.toBeInTheDocument()
    })

    it('should render ai guidance suggestions and add select all suggestion card', () => {
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')

        renderComponent({
            guidanceAiSuggestions: [aiGuidance],
            shopName: 'test',
            showAllSuggestionsCard: true,
        })

        expect(screen.getByText(aiGuidance.name)).toBeInTheDocument()
        expect(screen.getByText('See All Suggestions')).toBeInTheDocument()
    })

    it('should render ai guidance suggestions banner', () => {
        renderComponent({
            guidanceAiSuggestions: [],
            shopName: 'test',
            showBanner: true,
        })

        expect(
            screen.getByText(
                'You’ve added all AI-generated suggestions to your library.'
            )
        ).toBeInTheDocument()
    })

    it('should execute onClick on click on ai guidance suggestion card', () => {
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')

        renderComponent({
            guidanceAiSuggestions: [aiGuidance],
            shopName: 'test',
            showAllSuggestionsCard: true,
        })

        const aiGuidanceSuggestion = screen.getByText(aiGuidance.name)
        userEvent.click(aiGuidanceSuggestion)

        expect(history.push).toHaveBeenCalledWith(
            '/app/automation/shopify/test/ai-agent/guidance/library/ai_guidance_id1'
        )
    })

    it('should execute onClick on click on select all suggestion card', () => {
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')

        renderComponent({
            guidanceAiSuggestions: [aiGuidance],
            shopName: 'test',
            showAllSuggestionsCard: true,
        })

        const seeAllSuggestionsCard = screen.getByText('See All Suggestions')
        userEvent.click(seeAllSuggestionsCard)

        expect(history.push).toHaveBeenCalledWith(
            '/app/automation/shopify/test/ai-agent/guidance/templates'
        )
    })
})
