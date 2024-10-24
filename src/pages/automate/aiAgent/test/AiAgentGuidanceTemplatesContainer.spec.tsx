import {screen} from '@testing-library/react'
import React from 'react'

import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithRouter} from 'utils/testing'

import {AiAgentGuidanceTemplatesContainer} from '../AiAgentGuidanceTemplatesContainer'
import {getGuidanceTemplateFixture} from '../fixtures/guidanceTemplate.fixture'
import {useAiAgentHelpCenter} from '../hooks/useAiAgentHelpCenter'
import {useGuidanceTemplates} from '../hooks/useGuidanceTemplates'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../hooks/useGuidanceTemplates', () => ({
    useGuidanceTemplates: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')
jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled')

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceTemplates = jest.mocked(useGuidanceTemplates)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = () => {
    renderWithRouter(<AiAgentGuidanceTemplatesContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance/templates`,
        route: '/shopify/test-shop/ai-agent/guidance/templates',
    })
}
describe('<AiAgentGuidanceTemplatesContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceTemplates.mockReturnValue({guidanceTemplates: []})
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })

    it('should render loader', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render guidance templates', () => {
        const template = getGuidanceTemplateFixture('order-status')

        mockedUseGuidanceTemplates.mockReturnValue({
            guidanceTemplates: [template],
        })

        renderComponent()

        expect(screen.getByText(template.name)).toBeInTheDocument()
        expect(screen.getByText('Create custom Guidance')).toBeInTheDocument()
    })
})
