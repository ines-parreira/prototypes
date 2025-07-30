// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, createEvent, fireEvent, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { ulid } from 'ulidx'

import { useFlag } from 'core/flags'
import { billingState } from 'fixtures/billing'
import { defaultUseAiAgentOnboardingNotification } from 'fixtures/onboardingStateNotification'
import useAppDispatch from 'hooks/useAppDispatch'
import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
    useListTrackstarConnections,
} from 'models/workflows/queries'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import useThreeplIntegrations from 'pages/aiAgent/actions/hooks/useThreeplIntegrations'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import CreateActionView from '../CreateActionView'
import GuidanceReferenceProvider from '../providers/GuidanceReferenceProvider'

jest.mock('models/workflows/queries')
jest.mock('models/knowledgeService/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/useThreeplIntegrations')
jest.mock('core/flags')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseApps = jest.mocked(useApps)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockuse3plIntegrations = jest.mocked(useThreeplIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs,
)
const mockUseFlag = jest.mocked(useFlag)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)
const mockUseFindAllGuidancesKnowledgeResources = jest.mocked(
    useFindAllGuidancesKnowledgeResources,
)
const mockStore = configureMockStore<RootState, StoreDispatch>()

const queryClient = mockQueryClient()

describe('<CreateActionView />', () => {
    beforeEach(() => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [],
            actionsApps: [],
        })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseAppDispatch.mockReturnValue(jest.fn())
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<
            typeof useDownloadWorkflowConfigurationStepLogs
        >)
        mockUseFlag.mockReturnValue(true)
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockuse3plIntegrations.mockReturnValue([])
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockUseListTrackstarConnections.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListTrackstarConnections>)
        mockUseFindAllGuidancesKnowledgeResources.mockReturnValue({
            data: {},
        } as unknown as ReturnType<
            typeof useFindAllGuidancesKnowledgeResources
        >)
    })

    it('should render create action page', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Create Action')).toBeInTheDocument()
    })

    it('should redirect on "Back to support actions" click', () => {
        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to support actions'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/shopify-store/actions',
        )
    })

    it('should redirect on "Cancel" click', () => {
        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/shopify-store/actions`,
        )
    })

    it('should redirect to actions on create success', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/shopify-store/actions`,
        )
    })

    it('should redirect to AI Agent test on create success', () => {
        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        const { rerender } = renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Create and test'))
        })

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/shopify-store/test`,
        )
    })

    it('should disable "Create and test" button if action is disabled', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <GuidanceReferenceProvider actions={[]}>
                        <CreateActionView />
                    </GuidanceReferenceProvider>
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable Action'))
        })

        expect(
            screen.getByRole('button', { name: 'Create and test' }),
        ).toBeAriaDisabled()
    })

    it('should disable create buttons if action is editing', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: true,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: /Create Action/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: /Create and test/ }),
        ).toBeAriaDisabled()
    })

    it('should display errors', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(notify).toHaveBeenCalledWith({
            showDismissButton: true,
            status: NotificationStatus.Error,
            message: 'Fix errors in order to create Action',
        })

        expect(screen.getByText('Action name is required')).toBeInTheDocument()
        expect(mockUpsertAction).not.toHaveBeenCalled()
    })

    it('should display recommended conditions alert', () => {
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
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                            },
                            {
                                kind: 'order',
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
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
                            ],
                        },
                    },
                },
            ],
            is_draft: false,
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
        const configuration = b.build()
        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        history.push(
            '/app/ai-agent/:shopType/:shopName/actions/new',
            configuration,
        )
        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )
        expect(
            screen.getByText(
                'We recommend the conditions below to ensure this Action works properly.',
            ),
        ).toBeInTheDocument()
    })

    it('should have action name not focused when isTemplate=true', () => {
        const b = new WorkflowConfigurationBuilder({
            id: ulid(),
            name: 'test name',
            initialStep: {
                id: ulid(),
                kind: 'end',
                settings: {
                    success: true,
                },
            },
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: 'test instructions',
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
                        conditions: null,
                    },
                },
            ],
            is_draft: false,
            apps: [],
            available_languages: [],
        })
        const configuration = b.build()
        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        history.push(
            '/app/ai-agent/:shopType/:shopName/actions/new',
            configuration,
        )

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )

        const nameInput = screen.queryAllByRole('textbox')[0]
        expect(document.activeElement).not.toBe(nameInput)
    })

    it('should have action name focused when not a template', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        const nameInput = screen.queryAllByRole('textbox')[0]
        expect(document.activeElement).toBe(nameInput)
    })

    it('should create Action in advanced view', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            },
        )

        // Fill in the basic form
        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[0], {
                target: { value: 'Advanced Action' },
            })
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: { value: 'Advanced description' },
            })
        })

        // Switch to advanced view
        act(() => {
            fireEvent.click(screen.getByText(/Advanced options/i))
        })

        act(() => {
            fireEvent.click(screen.getByText('Convert To Advanced View'))
        })

        // Add a step in advanced view
        act(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        act(() => {
            fireEvent.click(screen.getByText('add'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request'))
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: { value: 'Request name' },
            })
        })

        act(() => {
            const editor = screen
                .getByTestId('visual-builder-node-edition')
                .querySelector('.public-DraftEditor-content')!

            const event = createEvent.paste(editor, {
                clipboardData: {
                    types: ['text/plain'],
                    getData: () => 'https://example.com',
                },
            })

            fireEvent(editor, event)
        })

        act(() => {
            fireEvent.click(screen.getByText('Save'))
        })

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(mockUpsertAction).toHaveBeenCalledWith([
            {
                internal_id: expect.any(String),
                store_name: 'shopify-store',
                store_type: 'shopify',
            },
            expect.objectContaining({
                name: 'Advanced Action',
                advanced_datetime: expect.any(String),
                steps: [
                    {
                        id: expect.any(String),
                        kind: 'http-request',
                        settings: expect.objectContaining({
                            headers: {},
                            method: 'GET',
                            name: 'Request name',
                            url: 'https://example.com',
                            variables: [],
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
                ],
                entrypoints: [
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            instructions: 'Advanced description',
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
                            conditions: null,
                        },
                    },
                ],
            }),
        ])
    })

    it('should open/close visual builder', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        // Switch to advanced view
        act(() => {
            fireEvent.click(screen.getByText(/Advanced options/i))
        })

        act(() => {
            fireEvent.click(screen.getByText('Convert To Advanced View'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        act(() => {
            fireEvent.click(screen.getByText('add'))
        })

        expect(
            screen.getByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('Create Action')).not.toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.queryByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.',
            ),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Create Action')).toBeInTheDocument()
    })

    it('should set up correct navigation history when clicking Create and Test', () => {
        const history = createMemoryHistory({
            initialEntries: [`/app/ai-agent/shopify/shopify-store/actions/new`],
        })
        const historyPushSpy = jest.spyOn(history, 'push')
        const historyReplaceSpy = jest.spyOn(history, 'replace')

        const { rerender } = renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/new',
                route: `/app/ai-agent/shopify/shopify-store/actions/new`,
            },
        )

        // Click Create and Test button
        act(() => {
            fireEvent.click(screen.getByText('Create and test'))
        })

        // Mock successful creation
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        // Verify that replace was called first with the edit route
        expect(historyReplaceSpy).toHaveBeenCalledWith(
            expect.stringMatching(
                /\/app\/ai-agent\/shopify\/shopify-store\/actions\/edit\/.*/,
            ),
        )

        // Verify that push was called second with the test route
        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/shopify-store/test`,
        )

        // Verify the order of operations
        const replaceCalls = historyReplaceSpy.mock.invocationCallOrder
        const pushCalls = historyPushSpy.mock.invocationCallOrder
        expect(Math.min(...replaceCalls)).toBeLessThan(Math.min(...pushCalls))
    })

    it('should trigger call to send activate AI agent notification when successfully creating Action', () => {
        const { rerender } = renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnTriggerActivateAiAgentNotification,
        ).toHaveBeenCalled()
    })

    it('should not trigger call to send activate AI agent notification when creating Action is not successfull', () => {
        const { rerender } = renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnTriggerActivateAiAgentNotification,
        ).not.toHaveBeenCalled()
    })

    it('should trigger call to send activate AI agent notification when click on Create and test', () => {
        const { rerender } = renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Create and test'))
        })

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnTriggerActivateAiAgentNotification,
        ).toHaveBeenCalled()
    })

    it('should disable "Create Action" and "Create and test" buttons if fetching onboarding notification state is still loading', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isLoading: true,
        })

        renderWithRouter(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: 'Create and test' }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: 'Create Action' }),
        ).toBeAriaDisabled()
    })
})
