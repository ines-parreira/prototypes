import {act, fireEvent, render} from '@testing-library/react'
import React from 'react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import {VisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {RemoveItemNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import RemoveItemEditor from '../RemoveItemEditor'

describe('<RemoveItemEditor />', () => {
    it('should dispatch SET_TOUCHED', () => {
        const nodeInEdition: RemoveItemNodeType = {
            ...buildNodeCommonProperties(),
            id: 'remove_item1',
            type: 'remove_item',
            data: {
                customerId: '{{objects.customer.id}}',
                orderExternalId: '{{objects.order.external_id}}',
                integrationId: '{{store.helpdesk_integration_id}}',
                productVariantId: '',
                quantity: '',
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()

        const {container} = render(
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
                                target: 'remove_item1',
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
                                target: 'remove_item1',
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
                <NodeEditorDrawerContext.Provider value={{onClose: jest.fn()}}>
                    <RemoveItemEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>
        )

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content'
            )[0]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                productVariantId: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content'
            )[1]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(2, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                quantity: true,
            },
        })

        expect(mockGetVariableListForNode).toHaveBeenCalledWith(
            nodeInEdition.id
        )
    })
})
