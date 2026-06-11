import { render } from '@repo/testing'

// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { screen } from '@testing-library/react'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'

import { ActionTemplatesView } from '../ActionTemplatesView'

jest.mock('@repo/feature-flags')
jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const useGetWorkflowConfigurationTemplatesMock = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
describe('<ActionTemplatesView  />', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        useGetWorkflowConfigurationTemplatesMock.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
    })
    it('should render template view', () => {
        render(<ActionTemplatesView />, {
            path: '/:shopType/:shopName/ai-agent/actions/',
            initialEntries: ['/shopify/my-shop/ai-agent/actions/'],
        })
        expect(
            screen.getByText(
                'Choose a template and customize it to fit your needs',
            ),
        ).toBeInTheDocument()
    })
})
