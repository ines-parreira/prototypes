import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { ulid } from 'ulidx'

import { IntegrationType } from 'models/integration/constants'
import {
    useGetWorkflowConfiguration,
    useListTrackstarConnections,
} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import EditActionViewContainer from '../EditActionViewContainer'

jest.mock('models/workflows/queries')
jest.mock('../EditActionView', () => () => <div>EditActionView</div>)

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => {
    return {
        __esModule: true,
        AiAgentLayout: () => <div>AiAgentLayout</div>,
    }
})
jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseApps = jest.mocked(useApps)
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)

const mockUseGetWorkflowConfiguration = jest.mocked(useGetWorkflowConfiguration)

const queryClient = mockQueryClient()

describe('<EditActionViewContainer />', () => {
    it("should redirect to actions page if configuration doesn't exist", () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/test123`,
            ],
        })
        const historyReplaceSpy = jest.spyOn(history, 'replace')
        mockUseListTrackstarConnections.mockReturnValue({
            data: { sandbox: { integration_name: 'sandbox', error: true } },
            isLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)
        mockUseApps.mockReturnValue({
            apps: [
                {
                    icon: '/assets/img/integrations/someid.png',
                    id: 'someid',
                    name: 'Some App',
                    type: IntegrationType.App,
                },
                {
                    icon: '/assets/img/integrations/recharge.png',
                    id: 'recharge',
                    name: 'Recharge',
                    type: IntegrationType.Recharge,
                },
                {
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                },
                {
                    icon: '/assets/img/integrations/sandbox.png',
                    id: 'sandbox',
                    name: 'Sandbox',
                    type: IntegrationType.App,
                },
            ],
            isLoading: false,
            actionsApps: [
                {
                    id: 'sandbox',
                    auth_type: 'trackstar',
                    auth_settings: {
                        integration_name: 'sandbox',
                    },
                },
            ],
        })
        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: null,
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <EditActionViewContainer />
            </QueryClientProvider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/test123`,
            },
        )

        expect(mockUseGetWorkflowConfiguration).toHaveBeenCalledWith(
            'test123',
            expect.anything(),
        )
        expect(historyReplaceSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/app/ai-agent/shopify/shopify-store/actions',
            }),
        )
    })

    it('should render multi step Action page', () => {
        const b = new WorkflowConfigurationBuilder({
            id: ulid(),
            name: 'Action name',
            initialStep: {
                id: ulid(),
                kind: 'http-request',
                settings: {
                    headers: {},
                    method: 'GET',
                    name: '',
                    url: 'https://example.com',
                    variables: [],
                },
            },
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: 'instructions',
                        requires_confirmation: false,
                    },
                    deactivated_datetime: null,
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            is_draft: false,
            apps: [],
            available_languages: [],
        })
        b.insertHttpRequestConditionAndEndStepAndSelect('success', {
            success: true,
        })
        b.selectParentStep()
        b.insertHttpRequestConditionAndEndStepAndSelect('error', {
            success: false,
        })

        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: b.build(),
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <EditActionViewContainer />
            </QueryClientProvider>,
        )

        expect(screen.getByText('EditActionView')).toBeInTheDocument()
    })

    it('should render loading', () => {
        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: undefined,
            isInitialLoading: true,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <EditActionViewContainer />
            </QueryClientProvider>,
        )

        expect(screen.getByText('AiAgentLayout')).toBeInTheDocument()
    })
})
