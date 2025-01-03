import {QueryClientProvider} from '@tanstack/react-query'
import {act, createEvent, fireEvent, screen} from '@testing-library/react'

import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {useFlag} from 'common/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import use3plIntegrations from 'pages/aiAgent/actions/hooks/use3plIntegrations'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import {useAiAgentEnabled} from 'pages/aiAgent/hooks/useAiAgentEnabled'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import CreateActionView from '../CreateActionView'

jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/use3plIntegrations')
jest.mock('common/flags')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseApps = jest.mocked(useApps)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockuse3plIntegrations = jest.mocked(use3plIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs
)
const mockUseFlag = jest.mocked(useFlag)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)

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
    })

    it('should render create action page', () => {
        renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>
        )

        expect(screen.getByText('Create Action')).toBeInTheDocument()
    })

    it('should redirect on "Back to actions" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to actions'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/shopify-store/ai-agent/actions'
        )
    })

    it('should redirect on "Cancel" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions`
        )
    })

    it('should redirect to actions on create success', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            }
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/actions`
        )
    })

    it('should redirect to AI Agent test on create success', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        const {rerender} = renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/automation/:shopType/:shopName/ai-agent/actions/new',
                route: `/app/automation/shopify/shopify-store/ai-agent/actions/new`,
            }
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
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/automation/shopify/shopify-store/ai-agent/test`
        )
    })

    it('should disable "Create and test" button if action is disabled', () => {
        renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable Action'))
        })

        expect(
            screen.getByRole('button', {name: 'Create and test'})
        ).toBeAriaDisabled()
    })

    it('should disable create buttons if action is editing', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: true,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByRole('button', {name: /Create Action/})
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', {name: /Create and test/})
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
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>
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
            }
        )

        // Fill in the basic form
        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[0], {
                target: {value: 'Advanced Action'},
            })
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: {value: 'Advanced description'},
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
                target: {value: 'Request name'},
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
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <CreateActionView />
                </QueryClientProvider>
            </Provider>
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
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.'
            )
        ).toBeInTheDocument()
        expect(screen.queryByText('Create Action')).not.toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.queryByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.'
            )
        ).not.toBeInTheDocument()
        expect(screen.getByText('Create Action')).toBeInTheDocument()
    })
})
