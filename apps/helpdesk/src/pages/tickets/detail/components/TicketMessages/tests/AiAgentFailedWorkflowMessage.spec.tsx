import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import {
    useGetConfigurationExecution,
    useGetWorkflowConfiguration,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import useGetAppImageUrl from 'pages/aiAgent/actions/hooks/useGetAppImageUrl'
import {
    LlmTriggeredExecution,
    TemplateConfiguration,
} from 'pages/aiAgent/actions/types'
import { Components } from 'rest_api/workflows_api/client.generated'

import FailedWorkflowMessage from '../AiAgentFailedWorkflowMessage'

jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/actions/hooks/useGetAppImageUrl')

const useGetConfigurationExecutionMock = assumeMock(
    useGetConfigurationExecution,
)
const useGetWorkflowConfigurationMock = assumeMock(useGetWorkflowConfiguration)
const useGetWorkflowConfigurationTemplatesMock = assumeMock(
    useGetWorkflowConfigurationTemplates,
)
const useGetAppImageUrlMock = assumeMock(useGetAppImageUrl)

const mockOriginalMessage = <div>Original Message</div>

const mockExecutionData = {
    id: 'execution-id-1',
    configuration_id: 'config-id-1',
    configuration_internal_id: 'config-internal-id-1',
    status: 'partial_success',
    trigger: 'llm-prompt',
    triggerable: true,
    state: {
        store: {
            type: 'shopify',
            name: 'test-domain',
        },
        steps_state: {
            'step-id-1': {
                kind: 'reusable-llm-prompt-call',
                success: true,
                at: '2025-01-01T00:00:00Z',
                steps_state: {
                    'template-step-id-1': {
                        kind: 'http-request',
                        success: true,
                        status_code: 200,
                        at: '2025-01-01T00:00:00Z',
                    },
                },
            },
            'step-id-2': {
                kind: 'reusable-llm-prompt-call',
                success: false,
                at: '2025-01-01T00:00:00Z',
                steps_state: {
                    'template-step-id-2': {
                        kind: 'http-request',
                        success: false,
                        status_code: 500,
                        at: '2025-01-01T00:00:00Z',
                    },
                },
            },
        },
    },
} as unknown as LlmTriggeredExecution

const mockActionConfiguration = {
    internal_id: 'config-internal-id-1',
    id: 'config-id-1',
    steps: [
        {
            id: 'step-id-1',
            kind: 'reusable-llm-prompt-call',
            settings: {
                configuration_id: 'template-id-1',
                configuration_internal_id: 'template-internal-id-1',
            },
        },
        {
            id: 'step-id-2',
            kind: 'reusable-llm-prompt-call',
            settings: {
                configuration_id: 'template-id-2',
                configuration_internal_id: 'template-internal-id-2',
            },
        },
    ],
} as unknown as Components.Schemas.GetWfConfigurationResponseDto

const mockTemplateConfigurations = [
    {
        id: 'template-id-1',
        internal_id: 'template-internal-id-1',
        name: 'Success Step',
        is_draft: false,
        initial_step_id: 'template-step-id-1',
        steps: [
            {
                id: 'template-step-id-1',
                kind: 'http-request',
                settings: {
                    name: 'Success Step',
                    url: 'https://httpbin.org/status/200',
                    method: 'GET',
                },
            },
        ],
        transitions: [],
        available_languages: [],
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-01T00:00:00Z',
        description: null,
        short_description: null,
        entrypoint: null,
        apps: [
            {
                type: 'shopify',
            },
        ],
    },
    {
        id: 'template-id-2',
        internal_id: 'template-internal-id-2',
        name: 'Failure Step',
        is_draft: false,
        initial_step_id: 'template-step-id-2',
        steps: [
            {
                id: 'template-step-id-2',
                kind: 'http-request',
                settings: {
                    name: 'Failure Step',
                    url: 'https://httpbin.org/status/500',
                    method: 'GET',
                },
            },
        ],
        transitions: [],
        available_languages: [],
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-01T00:00:00Z',
        description: null,
        short_description: null,
        entrypoint: null,
        apps: [
            {
                type: 'shopify',
            },
        ],
    },
] as unknown as TemplateConfiguration[]

const mockWorkflowData = {
    configurationId: 'config-id-1',
    executionId: 'execution-id-1',
    success: false,
}

describe('FailedWorkflowMessage', () => {
    beforeEach(() => {
        useGetAppImageUrlMock.mockReturnValue(
            'https://example.com/app-icon.png',
        )
    })

    it('should render original message missing necessary execution data', () => {
        render(
            <FailedWorkflowMessage
                workflowData={{}}
                originalMessage={mockOriginalMessage}
            />,
        )

        expect(screen.getByText('Original Message')).toBeInTheDocument()
    })

    it('should render original message when not partial success', () => {
        useGetConfigurationExecutionMock.mockReturnValue({
            data: { status: 'success' },
        } as any)
        useGetWorkflowConfigurationMock.mockReturnValue({
            data: mockActionConfiguration,
        } as any)
        useGetWorkflowConfigurationTemplatesMock.mockReturnValue({
            data: mockTemplateConfigurations,
        } as any)

        render(
            <FailedWorkflowMessage
                workflowData={mockWorkflowData}
                originalMessage={mockOriginalMessage}
            />,
        )

        expect(screen.getByText('Original Message')).toBeInTheDocument()
    })

    it('should render partial success message with successful and failed steps', () => {
        useGetConfigurationExecutionMock.mockReturnValue({
            data: mockExecutionData,
        } as any)
        useGetWorkflowConfigurationMock.mockReturnValue({
            data: mockActionConfiguration,
        } as any)
        useGetWorkflowConfigurationTemplatesMock.mockReturnValue({
            data: mockTemplateConfigurations,
        } as any)

        render(
            <FailedWorkflowMessage
                workflowData={mockWorkflowData}
                originalMessage={mockOriginalMessage}
            />,
        )

        expect(
            screen.getByText(
                /AI Agent did not send a response and handed over the ticket to your team/,
            ),
        ).toBeInTheDocument()

        expect(screen.getByText(/It successfully executed/)).toBeInTheDocument()

        expect(screen.getByText(/but failed to complete/)).toBeInTheDocument()

        // Check successful step
        expect(screen.getByText('Success Step')).toBeInTheDocument()

        // Check failed step
        expect(screen.getByText('Failure Step')).toBeInTheDocument()

        // Check link to events
        expect(screen.getByText('View the Actions events')).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/app/automation/shopify/test-domain/ai-agent/actions/events/config-id-1?execution_id=execution-id-1',
        )
    })

    it('should render custom http-request step name from parent settings', () => {
        useGetConfigurationExecutionMock.mockReturnValue({
            data: {
                status: 'partial_success',
                state: {
                    store: { type: 'shopify', name: 'test-domain' },
                    steps_state: {
                        'custom-step': {
                            kind: 'http-request',
                            success: true,
                            at: '2025-01-01T00:00:00Z',
                        },
                    },
                },
            },
        } as any)
        useGetWorkflowConfigurationMock.mockReturnValue({
            data: {
                steps: [
                    {
                        id: 'custom-step',
                        kind: 'http-request',
                        settings: {
                            name: 'Custom API Call',
                        },
                    },
                ],
            },
        } as any)
        useGetWorkflowConfigurationTemplatesMock.mockReturnValue({
            data: [],
        } as any)

        render(
            <FailedWorkflowMessage
                workflowData={mockWorkflowData}
                originalMessage={mockOriginalMessage}
            />,
        )

        expect(screen.getByText('Custom API Call')).toBeInTheDocument()
    })

    it('should render reusable LLM prompt call name from template configuration', () => {
        useGetConfigurationExecutionMock.mockReturnValue({
            data: {
                status: 'partial_success',
                state: {
                    store: { type: 'shopify', name: 'test-domain' },
                    steps_state: {
                        'llm-step': {
                            kind: 'reusable-llm-prompt-call',
                            success: true,
                            at: '2025-01-01T00:00:00Z',
                        },
                    },
                },
            },
        } as any)
        useGetWorkflowConfigurationMock.mockReturnValue({
            data: {
                steps: [
                    {
                        id: 'llm-step',
                        kind: 'reusable-llm-prompt-call',
                        settings: {
                            configuration_id: 'template-1',
                        },
                    },
                ],
            },
        } as any)
        useGetWorkflowConfigurationTemplatesMock.mockReturnValue({
            data: [
                {
                    id: 'template-1',
                    name: 'LLM Template Step',
                    steps: [],
                },
            ],
        } as any)

        render(
            <FailedWorkflowMessage
                workflowData={mockWorkflowData}
                originalMessage={mockOriginalMessage}
            />,
        )

        expect(screen.getByText('LLM Template Step')).toBeInTheDocument()
    })
})
