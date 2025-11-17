import React, { useMemo } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type { CancelSubscriptionNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'

import TextInputWithVariables from '../components/variables/TextInputWithVariables'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function CancelSubscriptionEditor({
    nodeInEdition,
}: {
    nodeInEdition: CancelSubscriptionNodeType
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
                        <Label isRequired>Subscription id</Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.subscriptionId}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_CANCEL_SUBSCRIPTION_NODE_SETTINGS',
                                    cancelSubscriptionNodeId: nodeInEdition.id,
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
                            allowFilters={true}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Reason</Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.reason}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_CANCEL_SUBSCRIPTION_NODE_SETTINGS',
                                    cancelSubscriptionNodeId: nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    reason: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                            error={nodeInEdition.data.errors?.reason}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        reason: true,
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
