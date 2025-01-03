import {QueryClientProvider} from '@tanstack/react-query'
import {screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'

import {ulid} from 'ulidx'

import {useGetWorkflowConfiguration} from 'models/workflows/queries'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import EditActionViewContainer from '../EditActionViewContainer'

jest.mock('models/workflows/queries')
jest.mock('../EditActionFormView', () => () => <div>EditActionFormView</div>)
jest.mock('../EditActionView', () => () => <div>EditActionView</div>)

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => {
    return {
        __esModule: true,
        AiAgentLayout: () => <div>AiAgentLayout</div>,
    }
})

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
            }
        )

        expect(mockUseGetWorkflowConfiguration).toHaveBeenCalledWith(
            'test123',
            expect.anything()
        )
        expect(historyReplaceSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname:
                    '/app/automation/shopify/shopify-store/ai-agent/actions',
            })
        )
    })

    it('should render multi step Action page if Action has multiple steps', () => {
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
            </QueryClientProvider>
        )

        expect(screen.getByText('EditActionView')).toBeInTheDocument()
    })

    it('should render old Action form page if Action has only one step', () => {
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

        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: b.build(),
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <EditActionViewContainer />
            </QueryClientProvider>
        )

        expect(screen.getByText('EditActionFormView')).toBeInTheDocument()
    })

    it('should render loading', () => {
        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: undefined,
            isInitialLoading: true,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <EditActionViewContainer />
            </QueryClientProvider>
        )

        expect(screen.getByText('AiAgentLayout')).toBeInTheDocument()
    })
})
