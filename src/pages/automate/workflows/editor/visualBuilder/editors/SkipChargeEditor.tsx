import React, {useMemo} from 'react'
import {Label} from '@gorgias/ui-kit'

import {Drawer} from 'pages/common/components/Drawer'
import {SkipChargeNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'

import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'
import TextInputWithVariables from '../components/variables/TextInputWithVariables'

import css from './NodeEditor.less'

export default function SkipChargeEditor({
    nodeInEdition,
}: {
    nodeInEdition: SkipChargeNodeType
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
                            Subscription id
                        </Label>
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
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Charge id
                        </Label>
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
                        />
                    </div>
                </div>
            </Drawer.Content>
        </>
    )
}
