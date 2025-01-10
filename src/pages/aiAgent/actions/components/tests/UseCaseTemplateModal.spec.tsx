import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'

import {ulid} from 'ulidx'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import UseCaseTemplateModal from '../UseCaseTemplateModal'

jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')

const queryClient = mockQueryClient()

const mockUseApps = jest.mocked(useApps)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'test name',
    initialStep: {
        id: ulid(),
        kind: 'reusable-llm-prompt-call',
        settings: {
            configuration_id: 'someid1',
            configuration_internal_id: 'someid1',
            values: {},
        },
    },
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: 'test instructions',
                requires_confirmation: true,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [
                    {
                        kind: 'customer',
                        integration_id: '{{store.helpdesk_integration_id}}',
                    },
                    {
                        kind: 'order',
                        integration_id: '{{store.helpdesk_integration_id}}',
                    },
                ],
                outputs: [],
                conditions: {
                    and: [
                        {
                            notEqual: [
                                {
                                    var: 'objects.order.external_status',
                                },
                                'open',
                            ],
                        },
                        {
                            doesNotExist: [
                                {
                                    var: 'objects.order.tracking_url',
                                },
                            ],
                        },
                        {
                            lessThan: [
                                {
                                    var: 'objects.order.total_amount',
                                },
                                1000,
                            ],
                        },
                    ],
                },
            },
        },
    ],
    is_draft: false,
    apps: [],
    available_languages: [],
    category: 'Orders',
})
b.insertReusableLLMPromptCallConditionAndEndStepAndSelect('success', {
    success: true,
})
b.insertReusableLLMPromptCallAndSelect({
    configuration_id: 'someid2',
    configuration_internal_id: 'someid2',
    values: {},
})
b.insertReusableLLMPromptCallConditionAndEndStepAndSelect('success', {
    success: true,
})
b.selectParentStep()
b.insertReusableLLMPromptCallConditionAndEndStepAndSelect('error', {
    success: false,
})
b.selectParentStep()
b.insertReusableLLMPromptCallConditionAndEndStepAndSelect('error', {
    success: false,
})

const template = b.build<ActionTemplate>()

describe('<UseCaseTemplateModal />', () => {
    beforeEach(() => {
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [
                {
                    icon: 'https://shopify.com/icon.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: 'shopify',
                },
                {
                    icon: 'https://app.com/app.png',
                    id: 'someapp',
                    name: 'Some app',
                    type: 'app',
                },
            ],
            actionsApps: [],
        } as unknown as ReturnType<typeof useApps>)
        mockUseUpsertAction.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [
                {
                    id: 'someid1',
                    internal_id: 'someid1',
                    name: 'test1',
                    apps: [{type: 'shopify'}],
                    entrypoints: [
                        {
                            kind: 'reusable-llm-prompt-call-step',
                            trigger: 'reusable-llm-prompt',
                            settings: {
                                requires_confirmation: false,
                                conditions: null,
                            },
                            deactivated_datetime: null,
                        },
                    ],
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
                },
                {
                    id: 'someid2',
                    internal_id: 'someid2',
                    name: 'test2',
                    apps: [{type: 'app', app_id: 'someapp'}],
                    entrypoints: [
                        {
                            kind: 'reusable-llm-prompt-call-step',
                            trigger: 'reusable-llm-prompt',
                            settings: {
                                requires_confirmation: false,
                                conditions: null,
                            },
                            deactivated_datetime: null,
                        },
                    ],
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
                },
            ],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
    })

    it('should render use case template modal', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>
        )

        expect(
            screen.getByText(
                'First, select the apps you need to perform this Action'
            )
        ).toBeInTheDocument()
    })

    it('should render selectable steps (app names)', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>
        )

        expect(screen.getByText('Shopify')).toBeInTheDocument()
        expect(screen.getByText('Some app')).toBeInTheDocument()
    })

    it('should disable continue button if none steps are selected', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>
        )

        expect(
            screen.getByRole('button', {name: /Continue/})
        ).toBeAriaDisabled()
    })

    it('should trigger onClose on cancel button click', () => {
        const mockOnClose = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal
                    onClose={mockOnClose}
                    template={template}
                />
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(mockOnClose).toHaveBeenCalled()
    })

    it('should move to confirmation step if only Shopify steps are selected', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        expect(
            screen.getByText('AI Agent will perform the following steps')
        ).toBeInTheDocument()
        expect(screen.getByText('test1 in Shopify')).toBeInTheDocument()
        expect(screen.getByText('Action conditions')).toBeInTheDocument()
        expect(screen.getByText('Order status is not open')).toBeInTheDocument()
        expect(
            screen.getByText('Order total amount (<) is less than 10')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent will always ask for customer confirmation before performing the Action'
            )
        ).toBeInTheDocument()
    })

    it('should create and enable Shopify Action', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            mutateAsync: mockUpsertAction,
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions',
                route: `/app/automation/shopify/acme/ai-agent/actions`,
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Create and enable'))
        })

        expect(mockUpsertAction).toHaveBeenCalledWith([
            {
                internal_id: expect.any(String),
                store_name: 'acme',
                store_type: 'shopify',
            },
            expect.objectContaining({
                apps: [{type: 'shopify'}],
                entrypoints: template.entrypoints,
                triggers: template.triggers,
                name: template.name,
                id: expect.any(String),
                internal_id: expect.any(String),
                steps: [
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'reusable-llm-prompt-call',
                        settings: {
                            configuration_id: 'someid1',
                            configuration_internal_id: 'someid1',
                            custom_inputs: {},
                            objects: {},
                            values: {},
                        },
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    }),
                ],
            }),
        ])
    })

    it('should redirect on create action success', () => {
        mockUseUpsertAction.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        const history = createMemoryHistory({
            initialEntries: [`/app/automation/shopify/acme/ai-agent/actions`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions',
                route: `/app/automation/shopify/acme/ai-agent/actions`,
                history,
            }
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/acme/ai-agent/actions'
        )
    })

    it('should allow to customize Shopify Action', () => {
        const history = createMemoryHistory({
            initialEntries: [`/app/automation/shopify/acme/ai-agent/actions`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions',
                route: `/app/automation/shopify/acme/ai-agent/actions`,
                history,
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Customize'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/acme/ai-agent/actions/new',
            expect.objectContaining({
                apps: [{type: 'shopify'}],
                entrypoints: template.entrypoints,
                triggers: template.triggers,
                name: template.name,
                id: expect.any(String),
                internal_id: expect.any(String),
                steps: [
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'reusable-llm-prompt-call',
                        settings: {
                            configuration_id: 'someid1',
                            configuration_internal_id: 'someid1',
                            custom_inputs: {},
                            objects: {},
                            values: {},
                        },
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    }),
                ],
            })
        )
    })

    it('should allow to go back to selection step', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions',
                route: `/app/automation/shopify/acme/ai-agent/actions`,
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        expect(
            screen.queryByText(
                'First, select the apps you need to perform this Action'
            )
        ).not.toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Back'))
        })

        expect(
            screen.getByText(
                'First, select the apps you need to perform this Action'
            )
        ).toBeInTheDocument()
    })

    it('should redirect to Action view on continue if Action has non-Shopify steps', () => {
        const history = createMemoryHistory({
            initialEntries: [`/app/automation/shopify/acme/ai-agent/actions`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <UseCaseTemplateModal onClose={jest.fn()} template={template} />
            </QueryClientProvider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions',
                route: `/app/automation/shopify/acme/ai-agent/actions`,
                history,
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Some app'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/acme/ai-agent/actions/new',
            expect.objectContaining({
                apps: [{type: 'app', app_id: 'someapp'}],
                entrypoints: template.entrypoints,
                triggers: template.triggers,
                name: template.name,
                id: expect.any(String),
                internal_id: expect.any(String),
                steps: [
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'reusable-llm-prompt-call',
                        settings: {
                            configuration_id: 'someid2',
                            configuration_internal_id: 'someid2',
                            custom_inputs: {},
                            objects: {},
                            values: {},
                        },
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    }),
                ],
            })
        )
    })
})
