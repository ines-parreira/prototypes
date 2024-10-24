import {Label} from '@gorgias/ui-kit'
import React, {useMemo} from 'react'

import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {RemoveItemNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {Drawer} from 'pages/common/components/Drawer'

import TextInputWithVariables from '../components/variables/TextInputWithVariables'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function RemoveItemEditor({
    nodeInEdition,
}: {
    nodeInEdition: RemoveItemNodeType
}) {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    const workflowVariables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Product variant id
                        </Label>
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
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Quantity
                        </Label>
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
                        />
                    </div>
                </div>
            </Drawer.Content>
        </>
    )
}
