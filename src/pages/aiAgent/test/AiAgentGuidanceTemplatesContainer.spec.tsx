// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentGuidanceTemplatesContainer } from '../AiAgentGuidanceTemplatesContainer'
import { getGuidanceTemplateFixture } from '../fixtures/guidanceTemplate.fixture'
import { useAiAgentHelpCenter } from '../hooks/useAiAgentHelpCenter'
import { useGuidanceTemplates } from '../hooks/useGuidanceTemplates'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../hooks/useGuidanceTemplates', () => ({
    useGuidanceTemplates: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceTemplates = jest.mocked(useGuidanceTemplates)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))

const helpCenter = getHelpCentersResponseFixture.data[0]

const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const queryClient = mockQueryClient()
const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentGuidanceTemplatesContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/guidance/templates`,
            route: '/shopify/test-shop/ai-agent/guidance/templates',
        },
    )
}
describe('<AiAgentGuidanceTemplatesContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceTemplates.mockReturnValue({ guidanceTemplates: [] })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })

    it('should render loader', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
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
