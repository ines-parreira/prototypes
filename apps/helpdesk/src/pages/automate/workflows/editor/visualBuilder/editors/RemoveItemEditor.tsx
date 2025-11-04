import React, { useMemo } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { RemoveItemNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'

import TextInputWithVariables from '../components/variables/TextInputWithVariables'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function RemoveItemEditor({
    nodeInEdition,
}: {
    nodeInEdition: RemoveItemNodeType
}) {
    const { dispatch, getVariableListForNode } = useVisualBuilderContext()

    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label isRequired>Product variant id</Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.productVariantId}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_REMOVE_ITEM_NODE_SETTINGS',
                                    removeItemNodeId: nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    productVariantId: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                            error={nodeInEdition.data.errors?.productVariantId}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        productVariantId: true,
                                    },
                                })
                            }}
                            allowFilters={true}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Quantity</Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.quantity}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_REMOVE_ITEM_NODE_SETTINGS',
                                    removeItemNodeId: nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    quantity: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                            error={nodeInEdition.data.errors?.quantity}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        quantity: true,
                                    },
                                })
                            }}
                            allowFilters={true}
                        />
                    </div>
                </div>
            </Drawer.Content>
        </>
    )
}
