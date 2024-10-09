import React from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {fromJS} from 'immutable'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from 'utils/testing'
import {
    useGetStoreApps,
    useGetWorkflowConfiguration,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {shopifyIntegration} from 'fixtures/integrations'

import useUpsertAction from '../hooks/useUpsertAction'
import useDeleteAction from '../hooks/useDeleteAction'
import useAddStoreApp from '../hooks/useAddStoreApp'

import EditActionFormView from '../EditActionFormView'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('models/workflows/queries')
jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('../hooks/useAddStoreApp')
jest.mock('../hooks/useUpsertAction')
jest.mock('../hooks/useDeleteAction')

const mockStore = configureMockStore([thunk])
const mockUseGetWorkflowConfiguration = jest.mocked(useGetWorkflowConfiguration)
const mockUseFlags = jest.mocked(useFlags)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockUseAiAgentEnabled = jest.mocked(useAiAgentEnabled)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseApps = jest.mocked(useApps)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)

const queryClient = mockQueryClient()

const defaultState = {
    integrations: fromJS({integrations: [shopifyIntegration]}),
}

describe('<EditActionFormView />', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseFlags.mockReturnValue({})
        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: {
                available_languages: [],
                entrypoints: [
                    {
                        deactivated_datetime: null,
                        kind: 'llm-conversation',
                        settings: {
                            instructions: 'test',
                            requires_confirmation: false,
                        },
                        trigger: 'llm-prompt',
                    },
                ],
                id: 'test1',
                initial_step_id: 'teststep1',
                internal_id: 'testinternal1',
                is_draft: false,
                name: 'test1',
                steps: [
                    {
                        id: 'teststep1',
                        kind: 'http-request',
                        settings: {
                            headers: {},
                            method: 'GET',
                            name: '',
                            url: 'https://example.com',
                            variables: [
                                {
                                    id: 'testvariable1',
                                    name: 'Request result',
                                    jsonpath: '$',
                                    data_type: null,
                                },
                            ],
                        },
                    },
                ],
                transitions: [],
                triggers: [
                    {
                        kind: 'llm-prompt',
                        settings: {
                            custom_inputs: [],
                            object_inputs: [],
                            outputs: [
                                {
                                    description: '',
                                    id: 'testoutput1',
                                    path: 'steps_state.teststep1.content.testvariable1',
                                },
                            ],
                        },
                    },
                ],
                updated_datetime: '2024-10-01T11:04:32.989Z',
                created_datetime: '2024-10-01T11:04:32.989Z',
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof mockUseGetWorkflowConfigurationTemplates>)
        mockUseAiAgentEnabled.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseDeleteAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof mockUseDeleteAction>)
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [],
            actionsApps: [],
        })
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
    })

    it('should render edit action form', () => {
        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <EditActionFormView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: '/shopify/acme/ai-agent/actions/edit/test1',
            }
        )

        expect(screen.getByLabelText(/Action name/)).toHaveValue('test1')
    })

    it('should render edit template action form', () => {
        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: {
                available_languages: [],
                entrypoints: [
                    {
                        deactivated_datetime: null,
                        kind: 'llm-conversation',
                        settings: {
                            instructions: 'test',
                            requires_confirmation: false,
                        },
                        trigger: 'llm-prompt',
                    },
                ],
                id: 'test1',
                initial_step_id: 'teststep1',
                internal_id: 'testinternal1',
                is_draft: false,
                name: 'test1',
                steps: [],
                transitions: [],
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
                updated_datetime: '2024-10-01T11:04:32.989Z',
                created_datetime: '2024-10-01T11:04:32.989Z',
                apps: [{type: 'shopify'}],
                template_internal_id: 'testtemplateinternal1',
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [
                {
                    available_languages: [],
                    entrypoints: [
                        {
                            deactivated_datetime: null,
                            kind: 'llm-conversation',
                            settings: {
                                instructions: 'test',
                                requires_confirmation: false,
                            },
                            trigger: 'llm-prompt',
                        },
                    ],
                    id: 'testtemplate1',
                    initial_step_id: 'teststep1',
                    internal_id: 'testtemplateinternal1',
                    is_draft: false,
                    name: 'test1',
                    steps: [],
                    transitions: [],
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
                    updated_datetime: '2024-10-01T11:04:32.989Z',
                    created_datetime: '2024-10-01T11:04:32.989Z',
                    apps: [{type: 'shopify'}],
                },
            ],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof mockUseGetWorkflowConfigurationTemplates>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <EditActionFormView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: '/shopify/shopify-store/ai-agent/actions/edit/test1',
            }
        )

        expect(screen.getByLabelText(/Action name/)).toHaveValue('test1')
    })

    it('should redirect back to actions if template does not exist', () => {
        const history = createMemoryHistory({
            initialEntries: [
                '/shopify/shopify-store/ai-agent/actions/edit/test1',
            ],
        })

        mockUseGetWorkflowConfiguration.mockReturnValue({
            data: {
                available_languages: [],
                entrypoints: [
                    {
                        deactivated_datetime: null,
                        kind: 'llm-conversation',
                        settings: {
                            instructions: 'test',
                            requires_confirmation: false,
                        },
                        trigger: 'llm-prompt',
                    },
                ],
                id: 'test1',
                initial_step_id: 'teststep1',
                internal_id: 'testinternal1',
                is_draft: false,
                name: 'test1',
                steps: [],
                transitions: [],
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
                updated_datetime: '2024-10-01T11:04:32.989Z',
                created_datetime: '2024-10-01T11:04:32.989Z',
                apps: [{type: 'shopify'}],
                template_internal_id: 'testtemplateinternal1',
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfiguration>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <EditActionFormView />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/:shopType/:shopName/ai-agent/actions/edit/:id',
                route: '/shopify/shopify-store/ai-agent/actions/edit/test1',
            }
        )

        expect(history.location.pathname).toEqual(
            '/app/automation/shopify/shopify-store/ai-agent/actions'
        )
    })
})
