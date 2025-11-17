import React from 'react'

import { act, fireEvent, render } from '@testing-library/react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { UpdateShippingAddressNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import UpdateShippingAddressEditor from '../UpdateShippingAddressEditor'

describe('<UpdateShippingAddressEditor />', () => {
    it('should dispatch SET_TOUCHED', () => {
        const nodeInEdition: UpdateShippingAddressNodeType = {
            ...buildNodeCommonProperties(),
            id: 'update_shipping_address1',
            type: 'update_shipping_address',
            data: {
                customerId: '{{objects.customer.id}}',
                orderExternalId: '{{objects.order.external_id}}',
                integrationId: '{{store.helpdesk_integration_id}}',
                name: '',
                address1: '',
                address2: '',
                city: '',
                zip: '',
                province: '',
                country: '',
                phone: '',
                lastName: '',
                firstName: '',
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
                                target: 'update_shipping_address1',
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
                                target: 'update_shipping_address1',
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
                    <UpdateShippingAddressEditor
                        nodeInEdition={nodeInEdition}
                    />
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
                name: true,
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
                address1: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[2]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(3, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                address2: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[3]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(4, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                city: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[4]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(5, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                zip: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[5]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(6, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                province: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[6]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(7, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                country: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[7]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(8, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                phone: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[8]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(9, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                firstName: true,
            },
        })

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[9]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(10, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                lastName: true,
            },
        })

        expect(mockGetVariableListForNode).toHaveBeenCalledWith(
            nodeInEdition.id,
        )
    })
})
