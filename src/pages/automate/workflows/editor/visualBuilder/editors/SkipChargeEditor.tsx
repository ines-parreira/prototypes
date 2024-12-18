import {Label} from '@gorgias/merchant-ui-kit'
import React, {useMemo} from 'react'

import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {SkipChargeNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {Drawer} from 'pages/common/components/Drawer'

import TextInputWithVariables from '../components/variables/TextInputWithVariables'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function SkipChargeEditor({
    nodeInEdition,
}: {
    nodeInEdition: SkipChargeNodeType
}) {
    const {dispatch, getVariableListForNode} = useVisualBuilderContext()

    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id]
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label isRequired>Subscription id</Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.subscriptionId}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_SKIP_CHARGE_NODE_SETTINGS',
                                    skipChargeNodeId: nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    subscriptionId: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                            error={nodeInEdition.data.errors?.subscriptionId}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        subscriptionId: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Charge id</Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.chargeId}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_SKIP_CHARGE_NODE_SETTINGS',
                                    skipChargeNodeId: nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    chargeId: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                            error={nodeInEdition.data.errors?.chargeId}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        chargeId: true,
                                    },
                                })
                            }}
                        />
                    </div>
                </div>
            </Drawer.Content>
        </>
    )
}
