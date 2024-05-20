import React from 'react'
import {screen} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithRouter} from 'utils/testing'
import {AiAgentGuidanceTemplatesContainer} from '../AiAgentGuidanceTemplatesContainer'
import {useGuidanceHelpCenter} from '../hooks/useGuidanceHelpCenter'
import {useGuidanceTemplates} from '../hooks/useGuidanceTemplates'
import {getGuidanceTemplateFixture} from '../fixtures/guidanceTemplate.fixture'

jest.mock('../hooks/useGuidanceHelpCenter', () => ({
    useGuidanceHelpCenter: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../hooks/useGuidanceTemplates', () => ({
    useGuidanceTemplates: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

const mockedUseGuidanceHelpCenter = jest.mocked(useGuidanceHelpCenter)
const mockedUseGuidanceTemplates = jest.mocked(useGuidanceTemplates)

jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentGuidance]: true,
    [FeatureFlagKey.AiAgentSettings]: true,
}))
const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = () => {
    renderWithRouter(<AiAgentGuidanceTemplatesContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance/templates`,
        route: '/shopify/test-shop/ai-agent/guidance/templates',
    })
}
describe('<AiAgentGuidanceTemplatesContainer />', () => {
    beforeEach(() => {
        mockedUseGuidanceHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceTemplates.mockReturnValue({guidanceTemplates: []})
    })

    it('should render loader', () => {
        mockedUseGuidanceHelpCenter.mockReturnValue(undefined)

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
        expect(
            screen.getByText('Create a guidance for your specific requirements')
        ).toBeInTheDocument()
    })
})
