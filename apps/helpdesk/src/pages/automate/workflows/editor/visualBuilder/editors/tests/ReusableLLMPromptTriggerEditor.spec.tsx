import React from 'react'

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { buildNodeCommonProperties } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { ReusableLLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import ReusableLLMPromptTriggerEditor from '../ReusableLLMPromptTriggerEditor'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

describe('<ReusableLLMPromptTriggerEditor />', () => {
    it('should render semi immutable inputs', () => {
        const nodeInEdition: ReusableLLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_trigger1',
            type: 'reusable_llm_prompt_trigger',
            data: {
                requires_confirmation: false,
                inputs: [
                    {
                        id: 'test',
                        name: 'test',
                        instructions: '',
                        data_type: 'string',
                    },
                    {
                        id: 'test2',
                        name: 'test2',
                        instructions: '',
                        data_type: 'string',
                    },
                ],
                conditionsType: null,
                conditions: [],
            },
        }

        const mockDispatch = jest.fn()

        render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [nodeInEdition],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
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
                        nodes: [nodeInEdition],
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
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <ReusableLLMPromptTriggerEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(
                within(
                    screen.getByDisplayValue('test').parentElement!
                        .parentElement!,
                ).getByText('close'),
            )
        })

        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('should dispatch ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const nodeInEdition: ReusableLLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_trigger1',
            type: 'reusable_llm_prompt_trigger',
            data: {
                requires_confirmation: false,
                inputs: [
                    {
                        id: 'test',
                        name: 'test',
                        instructions: '',
                        data_type: 'string',
                    },
                ],
                conditionsType: null,
                conditions: [],
            },
        }

        const mockDispatch = jest.fn()

        render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [nodeInEdition],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
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
                        nodes: [nodeInEdition],
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
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <ReusableLLMPromptTriggerEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Add Variable'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
        })
    })

    it('should dispatch DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const nodeInEdition: ReusableLLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_trigger1',
            type: 'reusable_llm_prompt_trigger',
            data: {
                requires_confirmation: false,
                inputs: [
                    {
                        id: 'test',
                        name: 'test',
                        instructions: '',
                        data_type: 'string',
                    },
                ],
                conditionsType: null,
                conditions: [],
            },
        }

        const mockDispatch = jest.fn()

        render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [nodeInEdition],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
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
                                id: 'reusable_llm_prompt_trigger1',
                                type: 'reusable_llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                },
                            },
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
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <ReusableLLMPromptTriggerEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(
                within(
                    screen.getByDisplayValue('test').parentElement!
                        .parentElement!,
                ).getByText('close'),
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
            id: 'test',
        })
    })

    it('should dispatch SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const nodeInEdition: ReusableLLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_trigger1',
            type: 'reusable_llm_prompt_trigger',
            data: {
                requires_confirmation: false,
                inputs: [
                    {
                        id: 'test',
                        name: 'test',
                        instructions: '',
                        data_type: 'string',
                    },
                ],
                conditionsType: null,
                conditions: [],
            },
        }

        const mockDispatch = jest.fn()

        render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [nodeInEdition],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
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
                                id: 'reusable_llm_prompt_trigger1',
                                type: 'reusable_llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                },
                            },
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
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <ReusableLLMPromptTriggerEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test'), {
                target: { value: 'some test' },
            })
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
            input: {
                id: 'test',
                name: 'some test',
                instructions: '',
                data_type: 'string',
            },
        })
    })

    it('should dispatch SET_TOUCHED for inputs', () => {
        const nodeInEdition: ReusableLLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reusable_llm_prompt_trigger1',
            type: 'reusable_llm_prompt_trigger',
            data: {
                requires_confirmation: false,
                inputs: [
                    {
                        id: 'test',
                        name: 'test name',
                        instructions: 'test instructions',
                        data_type: 'string',
                    },
                ],
                conditionsType: null,
                conditions: [],
            },
        }

        const mockDispatch = jest.fn()

        render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        name: '',
                        nodes: [nodeInEdition],
                        edges: [],
                        available_languages: [],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                        isTemplate: false,
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
                                id: 'reusable_llm_prompt_trigger1',
                                type: 'reusable_llm_prompt_trigger',
                                data: {
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                },
                            },
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
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <ReusableLLMPromptTriggerEditor
                        nodeInEdition={nodeInEdition}
                    />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('test name'))
        })

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('test instructions'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                inputs: {
                    test: {
                        name: true,
                    },
                },
            },
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(2, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                inputs: {
                    test: {
                        instructions: true,
                    },
                },
            },
        })
    })
})
