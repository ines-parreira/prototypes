import {act, fireEvent, render} from '@testing-library/react'
import React from 'react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import {VisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    CancelSubscriptionNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import CancelSubscriptionEditor from '../CancelSubscriptionEditor'

describe('<CancelSubscriptionEditor />', () => {
    it('should dispatch SET_TOUCHED', () => {
        const nodeInEdition: CancelSubscriptionNodeType = {
            ...buildNodeCommonProperties(),
            id: 'cancel_subscription1',
            type: 'cancel_subscription',
            data: {
                customerId: '{{objects.customer.id}}',
                integrationId: '{{store.helpdesk_integration_id}}',
                subscriptionId: '',
                reason: '',
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
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
                    target: 'cancel_subscription1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: false,
        }

        const {container} = render(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider value={{onClose: jest.fn()}}>
                    <CancelSubscriptionEditor nodeInEdition={nodeInEdition} />
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
                subscriptionId: true,
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
                reason: true,
            },
        })

        expect(mockGetVariableListForNode).toHaveBeenCalledWith(
            nodeInEdition.id
        )
    })
})
