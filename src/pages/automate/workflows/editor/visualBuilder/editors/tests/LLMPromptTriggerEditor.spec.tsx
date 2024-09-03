import React from 'react'
import {act, fireEvent, render, screen, within} from '@testing-library/react'

import {VisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {buildNodeCommonProperties} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import NodeEditorDrawerContext from '../../NodeEditorDrawerContext'

import LLMPromptTriggerEditor from '../LLMPromptTriggerEditor'

describe('<LLMPromptTriggerEditor />', () => {
    it('should not fully editable custom inputs', () => {
        const nodeInEdition: LLMPromptTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'llm_prompt_trigger1',
            type: 'llm_prompt_trigger',
            data: {
                instructions: '',
                requires_confirmation: false,
                custom_inputs: [
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
                object_inputs: [],
                conditionsType: null,
                conditions: [],
            },
        }

        const mockDispatch = jest.fn()

        render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: {
                        name: '',
                        nodes: [nodeInEdition],
                        edges: [],
                        available_languages: [],
                        wfConfigurationOriginal: {
                            id: '',
                            is_draft: false,
                            name: '',
                            internal_id: '',
                            initial_step_id: '',
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            triggers: [
                                {
                                    kind: 'llm-prompt',
                                    settings: {
                                        custom_inputs: [
                                            {
                                                id: 'test',
                                                name: 'test',
                                                instructions: '',
                                                data_type: 'string',
                                            },
                                        ],
                                        object_inputs: [],
                                        outputs: [],
                                    },
                                },
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
                                        requires_confirmation: false,
                                    },
                                },
                            ],
                        },
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                    },
                    checkInvalidConditionsForNode: () => false,
                    checkInvalidVariablesForNode: () => false,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    shouldShowErrors: false,
                }}
            >
                <NodeEditorDrawerContext.Provider value={{onClose: jest.fn()}}>
                    <LLMPromptTriggerEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>
        )

        act(() => {
            fireEvent.click(
                within(
                    screen.getByDisplayValue('test').parentElement!
                        .parentElement!
                ).getByText('close')
            )
        })

        expect(mockDispatch).not.toHaveBeenCalled()
    })
})
