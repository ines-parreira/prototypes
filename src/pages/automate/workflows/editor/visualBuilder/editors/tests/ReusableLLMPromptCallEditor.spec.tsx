import {act, fireEvent, screen} from '@testing-library/react'

import React from 'react'

import {useGetWorkflowConfigurationTemplate} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import {VisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {buildNodeCommonProperties} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {ReusableLLMPromptCallNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import ReusableLLMPromptCallEditor from '../ReusableLLMPromptCallEditor'

jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp')

const mockUseGetWorkflowConfigurationTemplate = jest.mocked(
    useGetWorkflowConfigurationTemplate
)
const mockUseApps = jest.mocked(useApps)
const mockUseGetAppFromTemplateApp = jest.mocked(useGetAppFromTemplateApp)

mockUseApps.mockReturnValue({
    isLoading: false,
    apps: [],
    actionsApps: [
        {
            id: 'someid',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
        {
            id: 'someid2',
            auth_type: 'oauth2-token',
            auth_settings: {
                url: 'https://example.com',
                refresh_token_url: 'https://example.com',
            },
        },
    ],
})

describe('<ReusableLLMPromptCallEditor />', () => {
    it('should render step editor with authentication and inputs', () => {
        mockUseGetWorkflowConfigurationTemplate.mockReturnValue({
            data: {
                internal_id: '01HWMV7AMNQYX73B007W65T2SE',
                id: '01HWMV7AMNV8WZV9YN8588C868',
                account_id: 1,
                name: 'Action step',
                is_draft: false,
                initial_step_id: '01HW8C2C5ZTGG38MJ6JKZ7N3HH',
                entrypoint: null,
                steps: [],
                transitions: [],
                available_languages: [],
                created_datetime: '2024-04-29T11:53:11.586Z',
                updated_datetime: '2024-04-29T13:32:57.221Z',
                deleted_datetime: null,
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
                entrypoints: [
                    {
                        kind: 'reusable-llm-prompt-call',
                        trigger: 'reusable-llm-prompt',
                        settings: {
                            requires_confirmation: false,
                            conditions: null,
                        },
                        deactivated_datetime: null,
                    },
                ],
                apps: [
                    {
                        type: 'app',
                        app_id: 'someid',
                    },
                ],
                inputs: [
                    {
                        id: 'value1',
                        name: 'value1',
                        description: '',
                        data_type: 'string',
                    },
                ],
            },
        } as unknown as ReturnType<
            typeof mockUseGetWorkflowConfigurationTemplate
        >)
        mockUseGetAppFromTemplateApp.mockReturnValue(
            jest.fn().mockReturnValue({
                id: 'someid',
                type: 'app',
                name: 'some app',
                icon: 'https://ok.com/1.png',
            })
        )

        const nodeInEdition: ReusableLLMPromptCallNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_call1',
            type: 'reusable_llm_prompt_call',
            data: {
                configuration_id: 'configuration_id1',
                configuration_internal_id: 'configuration_internal_id1',
                values: {
                    value1: 'value1',
                },
            },
        }

        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [
                            {
                                ...buildNodeCommonProperties(),
                                id: 'llm_prompt_trigger1',
                                type: 'llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                    instructions: '',
                                },
                            },
                            nodeInEdition,
                        ],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid',
                                api_key: 'some api key',
                            },
                        ],
                    },
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    initialVisualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [
                            {
                                ...buildNodeCommonProperties(),
                                id: 'llm_prompt_trigger1',
                                type: 'llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                    instructions: '',
                                },
                            },
                            nodeInEdition,
                        ],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
                    },
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider value={{onClose: jest.fn()}}>
                    <ReusableLLMPromptCallEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>
        )

        expect(screen.getByText('Action step in some app')).toBeInTheDocument()
        expect(
            screen.getByText(
                'This step requires an active some app account. Enter the API key from your some app account.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText('This step requires additional values.')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Find your API key in some app')
        ).toBeInTheDocument()

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('some api key'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            appId: 'someid',
            touched: {
                api_key: true,
            },
        })

        act(() => {
            fireEvent.change(screen.getByDisplayValue('some api key'), {
                target: {value: 'new some api key'},
            })
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(2, {
            type: 'SET_APP_API_KEY',
            appId: 'someid',
            apiKey: 'new some api key',
        })

        act(() => {
            fireEvent.change(screen.getByDisplayValue('value1'), {
                target: {value: 'new value1'},
            })
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(3, {
            type: 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE',
            reusableLLMPromptCallNodeId: 'reusable_llm_prompt_call1',
            inputId: 'value1',
            value: 'new value1',
        })

        expect(mockUseGetWorkflowConfigurationTemplate).toHaveBeenCalledWith(
            'configuration_id1'
        )
    })

    it('should render step editor with refresh token auth', () => {
        mockUseGetWorkflowConfigurationTemplate.mockReturnValue({
            data: {
                internal_id: '01HWMV7AMNQYX73B007W65T2SE',
                id: '01HWMV7AMNV8WZV9YN8588C868',
                account_id: 1,
                name: 'Action step',
                is_draft: false,
                initial_step_id: '01HW8C2C5ZTGG38MJ6JKZ7N3HH',
                entrypoint: null,
                steps: [],
                transitions: [],
                available_languages: [],
                created_datetime: '2024-04-29T11:53:11.586Z',
                updated_datetime: '2024-04-29T13:32:57.221Z',
                deleted_datetime: null,
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
                entrypoints: [
                    {
                        kind: 'reusable-llm-prompt-call',
                        trigger: 'reusable-llm-prompt',
                        settings: {
                            requires_confirmation: false,
                            conditions: null,
                        },
                        deactivated_datetime: null,
                    },
                ],
                apps: [
                    {
                        type: 'app',
                        app_id: 'someid2',
                    },
                ],
                inputs: [],
            },
        } as unknown as ReturnType<
            typeof mockUseGetWorkflowConfigurationTemplate
        >)
        mockUseGetAppFromTemplateApp.mockReturnValue(
            jest.fn().mockReturnValue({
                id: 'someid2',
                type: 'app',
                name: 'some app',
                icon: 'https://ok.com/1.png',
            })
        )

        const nodeInEdition: ReusableLLMPromptCallNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_call1',
            type: 'reusable_llm_prompt_call',
            data: {
                configuration_id: 'configuration_id1',
                configuration_internal_id: 'configuration_internal_id1',
                values: {},
            },
        }

        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [
                            {
                                ...buildNodeCommonProperties(),
                                id: 'llm_prompt_trigger1',
                                type: 'llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                    instructions: '',
                                },
                            },
                            nodeInEdition,
                        ],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid2',
                                refresh_token: 'some refresh token',
                            },
                        ],
                    },
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    initialVisualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [
                            {
                                ...buildNodeCommonProperties(),
                                id: 'llm_prompt_trigger1',
                                type: 'llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                    instructions: '',
                                },
                            },
                            nodeInEdition,
                        ],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
                    },
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider value={{onClose: jest.fn()}}>
                    <ReusableLLMPromptCallEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>
        )

        expect(screen.getByText('Action step in some app')).toBeInTheDocument()
        expect(
            screen.getByText(
                'This step requires an active some app account. Enter the refresh token from your some app account.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText('Find your refresh token in some app')
        ).toBeInTheDocument()

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('some refresh token'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            appId: 'someid2',
            touched: {
                refresh_token: true,
            },
        })

        act(() => {
            fireEvent.change(screen.getByDisplayValue('some refresh token'), {
                target: {value: 'new some refresh token'},
            })
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(2, {
            type: 'SET_APP_REFRESH_TOKEN',
            appId: 'someid2',
            refreshToken: 'new some refresh token',
        })
    })
})
