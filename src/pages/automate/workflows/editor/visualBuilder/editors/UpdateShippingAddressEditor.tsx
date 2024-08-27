import React, {useMemo} from 'react'
import {Label} from '@gorgias/ui-kit'

import {Drawer} from 'pages/common/components/Drawer'
import {UpdateShippingAddressNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'

import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'
import TextInputWithVariables from '../components/variables/TextInputWithVariables'

import css from './NodeEditor.less'

export default function UpdateShippingAddressEditor({
    nodeInEdition,
}: {
    nodeInEdition: UpdateShippingAddressNodeType
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
                            Name
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.name}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    name: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Address line 1
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.address1}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    address1: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Address line 2
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.address2}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    address2: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            City
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.city}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    city: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            ZIP code
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.zip}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    zip: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            State
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.province}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    province: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Country
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.country}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    country: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Phone number
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.phone}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    phone: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            First name
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.firstName}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    firstName: nextValue,
                                })
                            }}
                            variables={workflowVariables}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired>
                            Last name
                        </Label>
                        <TextInputWithVariables
                            value={nodeInEdition.data.lastName}
                            onChange={(nextValue) => {
                                dispatch({
                                    type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
                                    updateShippingAddressNodeId:
                                        nodeInEdition.id,
                                    ...nodeInEdition.data,
                                    lastName: nextValue,
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
