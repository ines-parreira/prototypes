import { assumeMock } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import history from 'pages/history'
import { renderWithRouter } from 'utils/testing'

import { GuidanceSection } from '../GuidanceSection'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

jest.mock('pages/aiAgent/hooks/useGuidanceAiSuggestions')
const mockUseGuidanceAiSuggestions = assumeMock(useGuidanceAiSuggestions)

const mockedShopName = 'test-shop'
const mockedHelpCenterId = 1

const renderComponent = () => {
    return renderWithRouter(
        <GuidanceSection
            shopName={mockedShopName}
            helpCenterId={mockedHelpCenterId}
        />,
    )
}

describe('GuidanceSection', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                guidance: '/guidance',
            },
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [
                getGuidanceArticleFixture(1),
                getGuidanceArticleFixture(2),
            ],
        } as unknown as ReturnType<typeof useGuidanceAiSuggestions>)
    })
    it('should render the component correctly', () => {
        renderComponent()

        expect(screen.getByText('Guidance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Instruct AI Agent using internal-facing Guidance to handle customer inquiries and follow end-to-end processes in line with your company policies.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('2 Guidance in use')).toBeInTheDocument()
    })
    it('should calls history.push when navigate to guidance tab button is clicked', () => {
        renderComponent()

        const navigateButton = screen.getByLabelText('Navigate to Guidance tab')
        fireEvent.click(navigateButton)

        expect(history.push).toHaveBeenCalledWith('/guidance')
    })
})
