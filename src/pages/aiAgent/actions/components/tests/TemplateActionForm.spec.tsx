import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ulid} from 'ulidx'

import {useFlag} from 'common/flags'
import {shopifyIntegration} from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetStoreApps,
    useUpsertAccountOauth2Token,
} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import useAddStoreApp from '../../hooks/useAddStoreApp'
import useDeleteAction from '../../hooks/useDeleteAction'
import useUpsertAction from '../../hooks/useUpsertAction'

import {TemplateConfiguration} from '../../types'
import TemplateActionForm from '../TemplateActionForm'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('models/workflows/queries')
jest.mock('../../hooks/useAddStoreApp')
jest.mock('../../hooks/useUpsertAction')
jest.mock('../../hooks/useDeleteAction')
jest.mock('hooks/useAppDispatch')

const mockUseFlag = useFlag as jest.Mock

const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({integrations: [shopifyIntegration]}),
}

const queryClient = mockQueryClient()

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const mockUseApps = jest.mocked(useApps)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseUpsertAccountOauth2Token = assumeMock(useUpsertAccountOauth2Token)
const useAppDispatchMock = assumeMock(useAppDispatch)

describe('<TemplateActionForm />', () => {
    const dispatchMock = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseFlags.mockReturnValue({})
        mockUseFlag.mockReturnValue(true)
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [
                {
                    icon: 'https://ok.com/1.png',
                    id: 'test',
                    name: 'My test app',
                    type: 'app',
                },
            ],
            actionsApps: [],
        } as unknown as ReturnType<typeof useApps>)
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseDeleteAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)
        mockUseUpsertAccountOauth2Token.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAccountOauth2Token>)
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should render template Action form', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={{
                            internal_id: ulid(),
                            id: ulid(),
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [{type: 'shopify'}],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        template={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [{type: 'shopify'}],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/:shopType/:shopName/ai-agent/actions/new`,
                route: '/shopify/shopify-store/ai-agent/actions/new',
            }
        )

        expect(
            screen.getByLabelText('Name', {exact: false})
        ).toBeInTheDocument()

        expect(screen.queryByText('View Action Events')).not.toBeInTheDocument()
    })

    it('should open app authentication modal if API key is missing', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={{
                            internal_id: ulid(),
                            id: ulid(),
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        template={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/shopify-store/ai-agent/actions/new',
            }
        )

        expect(screen.getByText('Action details')).toBeInTheDocument()
    })

    it('should not open app authentication modal if API key is already provided', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={{
                            internal_id: ulid(),
                            id: ulid(),
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [
                                {type: 'app', app_id: 'test', api_key: 'test'},
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        template={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/:shopType/:shopName/ai-agent/actions/new`,
                route: '/shopify/shopify-store/ai-agent/actions/new',
            }
        )

        expect(screen.queryByText('Action details')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Connect 3rd party app')
        ).not.toBeInTheDocument()
    })

    it('should display view app authentication button', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={{
                            internal_id: ulid(),
                            id: ulid(),
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [
                                {type: 'app', app_id: 'test', api_key: 'test'},
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            updated_datetime: new Date().toISOString(),
                        }}
                        template={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                        }}
                    />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getByText('View App Authentication'))
        })
        expect(screen.queryByText('Connect 3rd party app')).toBeVisible()

        expect(
            screen.getByText('Discard changes').closest('button')
        ).toHaveAttribute('aria-disabled', 'true')

        act(() => {
            fireEvent.change(screen.getByLabelText('API key', {exact: false}), {
                target: {value: 'update test'},
            })
        })

        expect(screen.getByLabelText('API key', {exact: false})).toHaveValue(
            'update test'
        )

        fireEvent.click(screen.getByText('Discard changes'))

        expect(screen.getByLabelText('API key', {exact: false})).toHaveValue(
            'test'
        )
        expect(screen.queryByText('View Events')).toBeInTheDocument()
    })

    it('should redirect back to actions if native integration is missing', () => {
        const history = createMemoryHistory({
            initialEntries: ['/shopify/shopify-store/ai-agent/actions/new'],
        })

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({integrations: []}),
                })}
            >
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={{
                            internal_id: ulid(),
                            id: ulid(),
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [{type: 'shopify'}],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        template={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [{type: 'shopify'}],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/shopify-store/ai-agent/actions/new',
                history,
            }
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/shopify-store/ai-agent/actions'
        )
    })

    it('should redirect back to actions after creating an Action', async () => {
        const configuration: WorkflowConfiguration = {
            internal_id: ulid(),
            id: ulid(),
            name: 'test',
            initial_step_id: null,
            available_languages: [],
            is_draft: false,
            apps: [{type: 'shopify'}],
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
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            steps: [],
            transitions: [],
        }
        const template: TemplateConfiguration = {
            name: 'test',
            internal_id: ulid(),
            id: ulid(),
            initial_step_id: '',
            is_draft: false,
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
            apps: [{type: 'shopify'}],
        }

        const history = createMemoryHistory({
            initialEntries: ['/shopify/shopify-store/ai-agent/actions/new'],
        })

        const historyPushSpy = jest.spyOn(history, 'push')

        const {rerender} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={configuration}
                        template={template}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/shopify-store/ai-agent/actions/new',
                history,
            }
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Create Action'})
            ).toBeAriaEnabled()
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        rerender(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={configuration}
                        template={template}
                    />
                </QueryClientProvider>
            </Provider>
        )

        await waitFor(() => {
            expect(historyPushSpy).toHaveBeenCalledWith(
                '/app/automation/shopify/shopify-store/ai-agent/actions'
            )
        })
    })

    it('should display validation error', () => {
        const configuration: WorkflowConfiguration = {
            internal_id: ulid(),
            id: ulid(),
            name: 'test',
            initial_step_id: null,
            available_languages: [],
            is_draft: false,
            apps: [{type: 'shopify'}],
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
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            steps: [],
            transitions: [],
            updated_datetime: new Date().toISOString(),
        }
        const template: TemplateConfiguration = {
            name: 'test',
            internal_id: ulid(),
            id: ulid(),
            initial_step_id: '',
            is_draft: false,
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
            apps: [{type: 'shopify'}],
        }

        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            error: {response: {status: 409}, isAxiosError: true},
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={configuration}
                        template={template}
                    />
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByText('An Action already exists with this name.')
        ).toBeVisible()
    })

    it('should create refresh token if authentication type is oauth2-token', async () => {
        const accountOauth2TokenMock = jest.fn().mockResolvedValue({
            data: {id: 'some-id'},
        })
        mockUseUpsertAccountOauth2Token.mockImplementation(
            () =>
                ({
                    mutateAsync: accountOauth2TokenMock,
                    isLoading: false,
                    isSuccess: true,
                }) as unknown as ReturnType<typeof useUpsertAccountOauth2Token>
        )
        const apps = [
            {
                account_oauth2_token_id: '01JBVWMCF2XT3RZNG4AG6Y1R5E',
                app_id: '61970bba4c685a1264c2d0fa',
                refresh_token: 'dsadasd',
                api_key: '123',
                type: 'app' as const,
            },
        ]
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: apps,
            actionsApps: [
                {
                    id: apps[0].app_id,
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://www.example.com',
                        refresh_token_url: 'https://www.refresh.com',
                    },
                },
            ],
        } as unknown as ReturnType<typeof useApps>)

        const configuration: WorkflowConfiguration = {
            internal_id: ulid(),
            id: ulid(),
            name: 'test',
            initial_step_id: null,
            available_languages: [],
            is_draft: false,
            apps: apps,
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
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            steps: [],
            transitions: [],
        }
        const template: TemplateConfiguration = {
            name: 'test',
            internal_id: ulid(),
            id: ulid(),
            initial_step_id: '',
            is_draft: false,
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
            apps: apps,
        }

        const history = createMemoryHistory({
            initialEntries: ['/shopify/shopify-store/ai-agent/actions/new'],
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={configuration}
                        template={template}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/shopify-store/ai-agent/actions/new',
                history,
            }
        )

        act(() => {
            fireEvent.change(
                screen.getByLabelText('Action name', {exact: false}),
                {
                    target: {value: 'Action name'},
                }
            )
        })
        act(() => {
            fireEvent.change(
                screen.getByLabelText('Action description', {exact: false}),
                {
                    target: {value: 'Action description'},
                }
            )
        })
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Create Action'})
            ).toBeAriaEnabled()
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(accountOauth2TokenMock).toHaveBeenCalledWith([
            undefined,
            {
                refresh_token: apps[0].refresh_token,
                id: apps[0].account_oauth2_token_id,
            },
        ])
        expect(dispatchMock).not.toHaveBeenCalled()
    })
    it('should fail and notify merchant of refresh token failure', async () => {
        const accountOauth2TokenMock = jest.fn().mockRejectedValue({})
        mockUseUpsertAccountOauth2Token.mockImplementation(
            () =>
                ({
                    mutateAsync: accountOauth2TokenMock,
                    isLoading: false,
                    isSuccess: true,
                }) as unknown as ReturnType<typeof useUpsertAccountOauth2Token>
        )
        const apps = [
            {
                account_oauth2_token_id: '01JBVWMCF2XT3RZNG4AG6Y1R5E',
                app_id: '61970bba4c685a1264c2d0fa',
                refresh_token: 'dsadasd',
                api_key: '123',
                type: 'app' as const,
            },
        ]
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: apps,
            actionsApps: [
                {
                    id: apps[0].app_id,
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://www.example.com',
                        refresh_token_url: 'https://www.refresh.com',
                    },
                },
            ],
        } as unknown as ReturnType<typeof useApps>)

        const configuration: WorkflowConfiguration = {
            internal_id: ulid(),
            id: ulid(),
            name: 'test',
            initial_step_id: null,
            available_languages: [],
            is_draft: false,
            apps: apps,
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
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            steps: [],
            transitions: [],
        }
        const template: TemplateConfiguration = {
            name: 'test',
            internal_id: ulid(),
            id: ulid(),
            initial_step_id: '',
            is_draft: false,
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
            apps: apps,
        }

        const history = createMemoryHistory({
            initialEntries: ['/shopify/shopify-store/ai-agent/actions/new'],
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionForm
                        configuration={configuration}
                        template={template}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/shopify-store/ai-agent/actions/new',
                history,
            }
        )

        act(() => {
            fireEvent.change(
                screen.getByLabelText('Action name', {exact: false}),
                {
                    target: {value: 'Action name'},
                }
            )
        })
        act(() => {
            fireEvent.change(
                screen.getByLabelText('Action description', {exact: false}),
                {
                    target: {value: 'Action description'},
                }
            )
        })
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Create Action'})
            ).toBeAriaEnabled()
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(accountOauth2TokenMock).toHaveBeenCalledWith([
            undefined,
            {
                refresh_token: apps[0].refresh_token,
                id: apps[0].account_oauth2_token_id,
            },
        ])
        expect(
            mockUseUpsertAction('create', 'shopify-store', 'shopify').mutate
        ).not.toHaveBeenCalled()
    })
})
