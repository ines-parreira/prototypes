import React, { useMemo } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { UpdateShippingAddressNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'

import TextInputWithVariables from '../components/variables/TextInputWithVariables'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function UpdateShippingAddressEditor({
    nodeInEdition,
}: {
    nodeInEdition: UpdateShippingAddressNodeType
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
                        <Label isRequired>Name</Label>
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
                            error={nodeInEdition.data.errors?.name}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        name: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Address line 1</Label>
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
                            error={nodeInEdition.data.errors?.address1}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        address1: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Address line 2</Label>
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
                            error={nodeInEdition.data.errors?.address2}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        address2: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>City</Label>
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
                            error={nodeInEdition.data.errors?.city}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        city: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>ZIP code</Label>
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
                            error={nodeInEdition.data.errors?.zip}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        zip: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>State</Label>
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
                            error={nodeInEdition.data.errors?.province}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        province: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Country</Label>
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
                            error={nodeInEdition.data.errors?.country}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        country: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Phone number</Label>
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
                            error={nodeInEdition.data.errors?.phone}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        phone: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>First name</Label>
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
                            error={nodeInEdition.data.errors?.firstName}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        firstName: true,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Last name</Label>
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
                            error={nodeInEdition.data.errors?.lastName}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        lastName: true,
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
