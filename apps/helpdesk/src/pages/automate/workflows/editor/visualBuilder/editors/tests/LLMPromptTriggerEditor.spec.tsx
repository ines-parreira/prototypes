import React from 'react'

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { buildNodeCommonProperties } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import LLMPromptTriggerEditor from '../LLMPromptTriggerEditor'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

describe('<LLMPromptTriggerEditor />', () => {
    it('should dispatch ADD_LLM_PROMPT_TRIGGER_INPUT', () => {
        const nodeInEdition: LLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'llm_prompt_trigger1',
            type: 'llm_prompt_trigger',
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
                instructions: '',
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
                    <LLMPromptTriggerEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Add Variable'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'ADD_LLM_PROMPT_TRIGGER_INPUT',
        })
    })

    it('should dispatch DELETE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const nodeInEdition: LLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'llm_prompt_trigger1',
            type: 'llm_prompt_trigger',
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
                instructions: '',
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
                    <LLMPromptTriggerEditor nodeInEdition={nodeInEdition} />
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
            type: 'DELETE_LLM_PROMPT_TRIGGER_INPUT',
            id: 'test',
        })
    })

    it('should dispatch SET_LLM_PROMPT_TRIGGER_INPUT', () => {
        const nodeInEdition: LLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'llm_prompt_trigger1',
            type: 'llm_prompt_trigger',
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
                instructions: '',
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
                    <LLMPromptTriggerEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test'), {
                target: { value: 'some test' },
            })
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_LLM_PROMPT_TRIGGER_INPUT',
            input: {
                id: 'test',
                name: 'some test',
                instructions: '',
                data_type: 'string',
            },
        })
    })

    it('should dispatch SET_TOUCHED for inputs', () => {
        const nodeInEdition: LLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'llm_prompt_trigger1',
            type: 'llm_prompt_trigger',
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
                instructions: '',
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
                    <LLMPromptTriggerEditor nodeInEdition={nodeInEdition} />
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
