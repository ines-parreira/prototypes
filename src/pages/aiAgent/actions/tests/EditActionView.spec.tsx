import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { produce } from 'immer'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { ulid } from 'ulidx'

import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
    useListTrackstarConnections,
} from 'models/workflows/queries'
import use3plIntegrations from 'pages/aiAgent/actions/hooks/use3plIntegrations'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import useDeleteAction from 'pages/aiAgent/actions/hooks/useDeleteAction'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import EditActionView from '../EditActionView'

jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/use3plIntegrations')
jest.mock('core/flags')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseApps = jest.mocked(useApps)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockuse3plIntegrations = jest.mocked(use3plIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseFlag = jest.mocked(useFlag)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    getIntegrationsList: () => [
        { type: 'shopify', count: 1 },
        { type: 'recharge', count: 0 },
    ],
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [
            {
                type: 'shopify',
                count: 1,
                meta: { store_name: 'shopify-store' },
            },
            {
                type: 'recharge',
                count: 0,
                meta: { store_name: 'recharge-store' },
            },
        ],
    }),
} as RootState)

const queryClient = mockQueryClient()

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'Action name',
    initialStep: {
        id: ulid(),
        kind: 'http-request',
        settings: {
            headers: {},
            method: 'GET',
            name: 'name',
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
                conditions: null,
            },
        },
    ],
    is_draft: false,
    apps: [],
    available_languages: [],
})
b.insertHttpRequestConditionAndEndStepAndSelect('success', { success: true })
b.selectParentStep()
b.insertHttpRequestConditionAndEndStepAndSelect('error', { success: false })

const configuration = b.build()

describe('<EditActionView />', () => {
    beforeEach(() => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseDeleteAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [],
            actionsApps: [],
        })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseFlag.mockReturnValue(true)
        mockUseAppDispatch.mockReturnValue(jest.fn())
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockuse3plIntegrations.mockReturnValue([])
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseListTrackstarConnections.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListTrackstarConnections>)
    })

    it('should render edit action page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })

    it('should redirect on "Back to actions" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to actions'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/shopify-store/ai-agent/actions',
        )
    })

    it('should redirect on "View Events" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('View Events'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions/events/${configuration.id}`,
        )
    })

    it('should redirect on "Cancel" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions`,
        )
    })

    it('should redirect to actions on edit success', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions`,
        )
    })

    it('should redirect to AI Agent test on edit success', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        const { rerender } = renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Save and test'))
        })

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/test`,
        )
    })

    it('should redirect to actions on delete success', () => {
        mockUseDeleteAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useDeleteAction>)

        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions`,
        )
    })

    it('should disable "Save and test" button if action is disabled', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView
                        configuration={produce(configuration, (draft) => {
                            if (draft.entrypoints) {
                                draft.entrypoints[0].deactivated_datetime =
                                    new Date().toISOString()
                            }
                        })}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: 'Save and test' }),
        ).toBeAriaDisabled()
    })

    it('should disable save buttons if action is editing', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: true,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: /Save changes/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: /Save and test/ }),
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
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('Action name'), {
                target: { value: '' },
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(notify).toHaveBeenCalledWith({
            showDismissButton: true,
            status: NotificationStatus.Error,
            message: 'Fix errors in order to save Action',
        })

        expect(screen.getByText('Action name is required')).toBeInTheDocument()
        expect(mockUpsertAction).not.toHaveBeenCalled()
    })

    it('should save changes', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(mockUpsertAction).toHaveBeenCalledWith([
            {
                internal_id: configuration.internal_id,
                store_name: 'shopify-store',
                store_type: 'shopify',
            },
            expect.objectContaining({
                name: configuration.name,
                steps: configuration.steps,
                entrypoints: configuration.entrypoints,
                triggers: configuration.triggers,
            }),
        ])
    })

    it('should open/close visual builder', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
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

        expect(
            screen.getByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('Save changes')).not.toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.queryByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.',
            ),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })
})
