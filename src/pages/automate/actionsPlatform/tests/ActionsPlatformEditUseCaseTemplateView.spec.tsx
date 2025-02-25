import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { ulid } from 'ulidx'

import {
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { renderWithDnD } from '../../../../utils/testing'
import ActionsPlatformEditUseCaseTemplateView from '../ActionsPlatformEditUseCaseTemplateView'
import useEditActionTemplate from '../hooks/useEditActionTemplate'
import { ActionTemplate } from '../types'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useEditActionTemplate')

const queryClient = mockQueryClient()
const mockUseEditActionTemplate = jest.mocked(useEditActionTemplate)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)
const mockEditActionTemplate = jest.fn()

mockUseEditActionTemplate.mockReturnValue({
    editActionTemplate: mockEditActionTemplate,
    isLoading: false,
})
mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [
        {
            name: 'Cancel order',
            apps: [
                {
                    type: 'shopify',
                },
            ],
            transitions: [],
            available_languages: [],
            created_datetime: '2021-09-01T00:00:00Z',
            entrypoints: [
                {
                    kind: 'reusable-llm-prompt-call-step',
                    trigger: 'reusable-llm-prompt',
                    settings: {
                        requires_confirmation: false,
                    },
                    deactivated_datetime: null,
                },
            ],
            id: 'cancelorder',
            initial_step_id: 'someid',
            internal_id: 'cancelorder',
            is_draft: false,
            steps: [],
            triggers: [
                {
                    kind: 'reusable-llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            updated_datetime: '2021-09-01T00:00:00Z',
        },
        {
            name: 'Refund order',
            apps: [
                {
                    type: 'shopify',
                },
            ],
            transitions: [],
            available_languages: [],
            created_datetime: '2021-09-01T00:00:00Z',
            entrypoints: [
                {
                    kind: 'reusable-llm-prompt-call-step',
                    trigger: 'reusable-llm-prompt',
                    settings: {
                        requires_confirmation: false,
                    },
                    deactivated_datetime: null,
                },
            ],
            id: 'refundorder',
            initial_step_id: 'someid',
            internal_id: 'refundorder',
            is_draft: false,
            steps: [],
            triggers: [
                {
                    kind: 'reusable-llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            updated_datetime: '2021-09-01T00:00:00Z',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
mockUseListActionsApps.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'test template',
    initialStep: {
        id: 'reusable-llm-prompt-call1',
        kind: 'reusable-llm-prompt-call',
        settings: {
            configuration_id: 'cancelorder',
            configuration_internal_id: 'cancelorder',
            custom_inputs: {},
            objects: {},
            values: {},
        },
    },
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: 'test',
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'llm-prompt',
            settings: {
                conditions: null,
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
        },
    ],
    category: 'Orders',
    apps: [{ type: 'shopify' }],
    available_languages: [],
})
b.insertReusableLLMPromptCallConditionAndEndStepAndSelect('success', {
    success: true,
})
b.selectParentStep()
b.insertReusableLLMPromptCallConditionAndEndStepAndSelect('error', {
    success: false,
})

const template = b.build()

describe('<ActionsPlatformEditUseCaseTemplateView />', () => {
    const renderApp = (template: ActionTemplate) => {
        renderWithDnD(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <ActionsPlatformEditUseCaseTemplateView
                            template={template}
                        />
                    </QueryClientProvider>
                </MemoryRouter>
            </Provider>,
        )
    }

    it('should render edit use case template view', () => {
        renderApp(template as ActionTemplate)

        expect(screen.getByDisplayValue(template.name)).toBeInTheDocument()
    })

    it('should allow to edit use case template', () => {
        renderApp(template as ActionTemplate)

        act(() => {
            fireEvent.click(screen.getByText('Add Step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Refund order'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(mockEditActionTemplate).toHaveBeenCalledWith([
            {
                internal_id: template.internal_id,
            },
            expect.objectContaining({
                name: template.name,
                steps: [
                    {
                        id: expect.any(String),
                        kind: 'reusable-llm-prompt-call',
                        settings: expect.objectContaining({
                            configuration_id: 'cancelorder',
                            configuration_internal_id: 'cancelorder',
                            custom_inputs: {},
                            objects: {},
                            values: {},
                        }),
                    },
                    {
                        id: expect.any(String),
                        kind: 'reusable-llm-prompt-call',
                        settings: expect.objectContaining({
                            configuration_id: 'refundorder',
                            configuration_internal_id: 'refundorder',
                            custom_inputs: {},
                            objects: {},
                            values: {},
                        }),
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    },
                ],
                entrypoints: template.entrypoints,
                triggers: template.triggers,
                category: template.category,
            }),
        ])
    })

    it('should display errors', () => {
        const mockEditActionTemplate = jest.fn()

        mockUseEditActionTemplate.mockReturnValue({
            editActionTemplate: mockEditActionTemplate,
            isLoading: false,
        })

        renderApp(template as ActionTemplate)

        act(() => {
            fireEvent.change(screen.getByDisplayValue(template.name), {
                target: { value: '' },
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(mockEditActionTemplate).not.toHaveBeenCalled()
        expect(screen.getByText('Action name is required')).toBeInTheDocument()
    })
})
