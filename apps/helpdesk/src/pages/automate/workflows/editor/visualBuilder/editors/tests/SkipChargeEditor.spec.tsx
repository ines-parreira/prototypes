import React from 'react'

import { act, fireEvent, render } from '@testing-library/react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { SkipChargeNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import SkipChargeEditor from '../SkipChargeEditor'

describe('<SkipChargeEditor />', () => {
    it('should dispatch SET_TOUCHED', () => {
        const nodeInEdition: SkipChargeNodeType = {
            ...buildNodeCommonProperties(),
            id: 'skip_charge1',
            type: 'skip_charge',
            data: {
                customerId: '{{objects.customer.id}}',
                integrationId: '{{store.helpdesk_integration_id}}',
                subscriptionId: '',
                chargeId: '',
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()

        const { container } = render(
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
                        edges: [
                            {
                                ...buildEdgeCommonProperties(),
                                source: 'llm_prompt_trigger1',
                                target: 'skip_charge1',
                            },
                        ],
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
                    getVariableListForNode: mockGetVariableListForNode,
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
                        edges: [
                            {
                                ...buildEdgeCommonProperties(),
                                source: 'llm_prompt_trigger1',
                                target: 'skip_charge1',
                            },
                        ],
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
                    <SkipChargeEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[0]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                subscriptionId: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[1]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(2, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                chargeId: true,
            },
        })

        expect(mockGetVariableListForNode).toHaveBeenCalledWith(
            nodeInEdition.id,
        )
    })
})
