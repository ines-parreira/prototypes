import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import type { LlmTriggeredExecution } from '../../types'
import ActionEventSidePanel from '../ActionEventSidePanel'

const queryClient = mockQueryClient()
const execution: LlmTriggeredExecution = {
    id: '1',
    state: {
        channel: 'email',
        trigger: 'llm-prompt',
    },
    trigger: 'llm-prompt',
    triggerable: false,
    awaited_callbacks: [],
    channel_actions: [],
    configuration_id: '1',
    configuration_internal_id: '1',
    current_step_id: '1',
}
const actionConfiguration = {
    account_id: 1,
    name: 'test',
    internal_id: '1',
    id: '1',
    initial_step_id: '',
    is_draft: false,
    entrypoints: [
        {
            kind: 'llm-conversation' as const,
            trigger: 'llm-prompt' as const,
            settings: {
                instructions: 'test',
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'llm-prompt' as const,
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
        },
    ],
    steps: [],
    transitions: [],
    available_languages: [],
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),
    apps: [{ type: 'app' as const, app_id: '1' }],
}

describe('<ActionEventSidePanel />', () => {
    it('should render component', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionEventSidePanel
                    isLoading={false}
                    isOpen={true}
                    onClose={jest.fn()}
                    execution={execution}
                    actionConfiguration={actionConfiguration}
                />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Event details')).toBeInTheDocument()
    })

    it('should render component with status success first then error', () => {
        const executionWithState: LlmTriggeredExecution = {
            ...execution,
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
                steps_state: {
                    '01J7ZRM17Q8VYJRP2F0HBH1B37': {
                        kind: 'http-request',
                        status_code: 401,
                        success: false,
                        content: '401 Unauthorized',
                        at: '2024-09-27T19:42:16.071Z',
                    },
                    '01J7ZRN69FEQGQ3YNN5ZX78NF7': {
                        kind: 'update-shipping-address',
                        success: true,
                        at: '2024-09-27T19:42:10.801Z',
                    },
                },
            },
        }

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionEventSidePanel
                    isLoading={false}
                    isOpen={true}
                    onClose={jest.fn()}
                    execution={executionWithState}
                    actionConfiguration={actionConfiguration}
                />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Event details')).toBeInTheDocument()

        const containers = screen
            .getAllByText(/status/i)
            .map((el) => el.closest('.container'))
        const successContainer = containers.find((container) =>
            container?.textContent?.includes('SUCCESS'),
        )
        const errorContainer = containers.find((container) =>
            container?.textContent?.includes('ERROR'),
        )

        expect(successContainer).not.toBeNull()
        expect(errorContainer).not.toBeNull()
        if (successContainer && errorContainer)
            expect(containers.indexOf(successContainer)).toBeLessThan(
                containers.indexOf(errorContainer),
            )
    })

    it('should render output variables when present', () => {
        const executionWithOutputs: LlmTriggeredExecution = {
            ...execution,
            state: {
                ...execution.state,
                steps_state: {
                    'step-1': {
                        kind: 'reusable-llm-prompt-call',
                        at: '2024-09-27T19:42:16.071Z',
                        outputs: {
                            result: null,
                            value: null,
                        },
                        objects: {},
                        custom_inputs: null,
                        values: {},
                        success: true,
                    },
                },
            },
        }

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionEventSidePanel
                    isLoading={false}
                    isOpen={true}
                    onClose={jest.fn()}
                    execution={executionWithOutputs}
                    actionConfiguration={actionConfiguration}
                />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Output Variables')).toBeInTheDocument()
        expect(screen.getByText('Outputs')).toBeInTheDocument()
        screen.getByText('Outputs').click()
        expect(screen.getByText(/"result": null/)).toBeInTheDocument()
        expect(screen.getByText(/"value": null/)).toBeInTheDocument()
    })

    it('should render output variables from nested reusable-llm-prompt-call steps', async () => {
        const executionWithNestedOutputs: LlmTriggeredExecution = {
            ...execution,
            state: {
                ...execution.state,
                steps_state: {
                    'outer-step': {
                        kind: 'reusable-llm-prompt-call',
                        at: '2024-09-27T19:42:16.071Z',
                        outputs: {
                            outerResult: null,
                        },
                        objects: {},
                        custom_inputs: null,
                        values: {},
                        success: true,
                        // Type cast due to OpenAPI type limitations
                        steps_state: {
                            'inner-step': {
                                kind: 'reusable-llm-prompt-call',
                                at: '2024-09-27T19:43:16.071Z',
                                outputs: {
                                    innerResult: null,
                                },
                                objects: {},
                                custom_inputs: null,
                                values: {},
                                success: true,
                            } as any,
                        } as any,
                    } as any,
                },
            },
        }

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionEventSidePanel
                    isLoading={false}
                    isOpen={true}
                    onClose={jest.fn()}
                    execution={executionWithNestedOutputs}
                    actionConfiguration={actionConfiguration}
                />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Output Variables')).toBeInTheDocument()
        expect(screen.getByText('Outputs')).toBeInTheDocument()
        screen.getByText('Outputs').click()
        expect(screen.getByText(/"outerResult": null/)).toBeInTheDocument()
        expect(screen.getByText(/"innerResult": null/)).toBeInTheDocument()
    })
})
