import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import _uniq from 'lodash/uniq'
import {Label, Tooltip} from '@gorgias/ui-kit'

import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import TextInput from 'pages/common/forms/input/TextInput'
import {
    extractVariablesFromNode,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    validateJSONWithVariables,
} from 'pages/automate/workflows/models/variables.model'
import {Drawer} from 'pages/common/components/Drawer'
import Button from 'pages/common/components/button/Button'
import useIsHttpRequestNodeErrored from 'pages/automate/workflows/hooks/useIsHttpRequestNodeErrored'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import TextInputWithVariables from '../../components/variables/TextInputWithVariables'
import TextareaWithVariables from '../../components/variables/TextareaWithVariables'
import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'
import css from '../NodeEditor.less'
import Headers from './Headers'
import MethodSelect from './MethodSelect'
import BodyContentTypeSelect from './BodyContentTypeSelect'
import FormUrlencoded from './FormUrlencoded'
import Variables from './Variables'
import TestRequestModal from './TestRequestModal'
import useSendTestRequest from './useSendTestRequest'
import TestRequestModalWithInputs from './TestRequestModalWithInputs'

const nameTextLimit = 100

export default function HttpRequestEditor({
    nodeInEdition,
}: {
    nodeInEdition: HttpRequestNodeType
}) {
    const {
        dispatch,
        visualBuilderGraph,
        checkNewVisualBuilderNode,
        handleDownloadHttpRequestEventLogs,
        getVariableListInChildren,
        isDownloadPending,
    } = useWorkflowEditorContext()
    const {isErrored} = useIsHttpRequestNodeErrored(nodeInEdition, true)
    const {isLoading: isTestRequestLoading, sendTestRequest} =
        useSendTestRequest(nodeInEdition.data, (result) => {
            dispatch({
                type: 'SET_HTTP_REQUEST_TEST_REQUEST_RESULT',
                httpRequestNodeId: nodeInEdition.id,
                result,
            })
        })
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
    const [isTestRequestModalOpen, setIsTestRequestModalOpen] = useState(false)
    const variablesInUse = useMemo(
        () => getVariableListInChildren(nodeInEdition.id),
        [getVariableListInChildren, nodeInEdition.id]
    )

    const downloadLogsButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        inputRef?.focus({preventScroll: true})
    }, [inputRef])

    const isNodeNew = useMemo(
        () => checkNewVisualBuilderNode(nodeInEdition.id),
        [nodeInEdition.id, checkNewVisualBuilderNode]
    )
    const workflowVariables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )
    const variables = useMemo(() => {
        const variables = _uniq(
            extractVariablesFromNode({
                type: 'http_request',
                data: nodeInEdition.data,
            })
        )
        return variables.map((variable) =>
            parseWorkflowVariable(variable, workflowVariables)
        )
    }, [workflowVariables, nodeInEdition.data])

    const handleAddVariable = useCallback(() => {
        dispatch({
            type: 'ADD_HTTP_REQUEST_VARIABLE',
            httpRequestNodeId: nodeInEdition.id,
        })
    }, [dispatch, nodeInEdition.id])
    const handleDeleteVariable = useCallback(
        (index: number) => {
            dispatch({
                type: 'DELETE_HTTP_REQUEST_VARIABLE',
                httpRequestNodeId: nodeInEdition.id,
                index,
            })
        },
        [dispatch, nodeInEdition.id]
    )
    const handleChangeVariable = useCallback(
        (
            index: number,
            variable: HttpRequestNodeType['data']['variables'][number]
        ) => {
            dispatch({
                type: 'SET_HTTP_REQUEST_VARIABLE',
                httpRequestNodeId: nodeInEdition.id,
                index,
                variable,
            })
        },
        [dispatch, nodeInEdition.id]
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition}>
                <Button
                    ref={downloadLogsButtonRef}
                    fillStyle="ghost"
                    intent="secondary"
                    isLoading={isDownloadPending}
                    isDisabled={isNodeNew}
                    onClick={() => {
                        void handleDownloadHttpRequestEventLogs(nodeInEdition)
                    }}
                >
                    <ButtonIconLabel icon="download">
                        Download Event logs
                    </ButtonIconLabel>
                </Button>
                {isNodeNew && (
                    <Tooltip target={downloadLogsButtonRef}>
                        Save this flow in order to download event logs.
                    </Tooltip>
                )}
            </NodeEditorDrawerHeader>
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label isRequired>Request name</Label>
                        <TextInput
                            className={css.textInput}
                            ref={setInputRef}
                            isRequired
                            maxLength={nameTextLimit}
                            onChange={(name: string) => {
                                dispatch({
                                    type: 'SET_HTTP_REQUEST_NAME',
                                    httpRequestNodeId: nodeInEdition.id,
                                    name,
                                })
                            }}
                            value={nodeInEdition.data.name}
                        />
                    </div>
                    <div className={css.urlMethodFormFieldGroup}>
                        <div className={css.formField}>
                            <Label isRequired>URL</Label>
                            <TextInputWithVariables
                                value={nodeInEdition.data.url}
                                onChange={(url: string) => {
                                    dispatch({
                                        type: 'SET_HTTP_REQUEST_URL',
                                        httpRequestNodeId: nodeInEdition.id,
                                        url,
                                    })
                                }}
                                variables={workflowVariables}
                            />
                        </div>
                        <div className={css.formField}>
                            <Label>HTTP method</Label>
                            <MethodSelect
                                value={nodeInEdition.data.method}
                                onChange={(method) => {
                                    dispatch({
                                        type: 'SET_HTTP_REQUEST_METHOD',
                                        httpRequestNodeId: nodeInEdition.id,
                                        method,
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div className={css.formField}>
                        <Label>Headers</Label>
                        <Headers
                            variables={workflowVariables}
                            headers={nodeInEdition.data.headers}
                            onChange={(index, header) => {
                                dispatch({
                                    type: 'SET_HTTP_REQUEST_HEADER',
                                    httpRequestNodeId: nodeInEdition.id,
                                    index,
                                    header,
                                })
                            }}
                            onDelete={(index) => {
                                dispatch({
                                    type: 'DELETE_HTTP_REQUEST_HEADER',
                                    httpRequestNodeId: nodeInEdition.id,
                                    index,
                                })
                            }}
                            onAdd={() => {
                                dispatch({
                                    type: 'ADD_HTTP_REQUEST_HEADER',
                                    httpRequestNodeId: nodeInEdition.id,
                                })
                            }}
                        />
                    </div>
                    {nodeInEdition.data.bodyContentType && (
                        <div className={css.formField}>
                            <Label>Request body</Label>
                            <BodyContentTypeSelect
                                value={nodeInEdition.data.bodyContentType}
                                onChange={(bodyContentType) => {
                                    dispatch({
                                        type: 'SET_HTTP_REQUEST_BODY_CONTENT_TYPE',
                                        httpRequestNodeId: nodeInEdition.id,
                                        bodyContentType,
                                    })
                                }}
                            />
                            {nodeInEdition.data.bodyContentType ===
                                'application/json' && (
                                <TextareaWithVariables
                                    value={nodeInEdition.data.json ?? ''}
                                    onChange={(json: string) => {
                                        dispatch({
                                            type: 'SET_HTTP_REQUEST_JSON',
                                            httpRequestNodeId: nodeInEdition.id,
                                            json,
                                        })
                                    }}
                                    variables={workflowVariables}
                                    error={
                                        validateJSONWithVariables(
                                            nodeInEdition.data.json ?? '',
                                            workflowVariables
                                        )
                                            ? undefined
                                            : 'Invalid JSON'
                                    }
                                />
                            )}
                            {nodeInEdition.data.bodyContentType ===
                                'application/x-www-form-urlencoded' && (
                                <FormUrlencoded
                                    items={nodeInEdition.data.formUrlencoded}
                                    variables={workflowVariables}
                                    onChange={(index, item) => {
                                        dispatch({
                                            type: 'SET_HTTP_REQUEST_FORM_URLENCODED_ITEM',
                                            httpRequestNodeId: nodeInEdition.id,
                                            index,
                                            item,
                                        })
                                    }}
                                    onDelete={(index) => {
                                        dispatch({
                                            type: 'DELETE_HTTP_REQUEST_FORM_URLENCODED_ITEM',
                                            httpRequestNodeId: nodeInEdition.id,
                                            index,
                                        })
                                    }}
                                    onAdd={() => {
                                        dispatch({
                                            type: 'ADD_HTTP_REQUEST_FORM_URLENCODED_ITEM',
                                            httpRequestNodeId: nodeInEdition.id,
                                        })
                                    }}
                                />
                            )}
                        </div>
                    )}
                    <Button
                        className={css.testRequestButton}
                        isLoading={isTestRequestLoading}
                        isDisabled={isErrored}
                        onClick={() => {
                            if (
                                !variables.length &&
                                !nodeInEdition.data.testRequestResult
                            ) {
                                void sendTestRequest()
                            }

                            setIsTestRequestModalOpen(true)
                        }}
                        intent="secondary"
                    >
                        {nodeInEdition.data.testRequestResult
                            ? 'View Test Results'
                            : 'Test request'}
                    </Button>
                    <div className={css.formField}>
                        <div className={css.withDescription}>
                            <Label>Output variables</Label>
                            <div>
                                Create variables from the request response which
                                can be used in subsequent steps
                            </div>
                        </div>
                        <Variables
                            nodeId={nodeInEdition.id}
                            variables={nodeInEdition.data.variables}
                            variablesInChildren={variablesInUse}
                            onChange={handleChangeVariable}
                            onDelete={handleDeleteVariable}
                            onAdd={handleAddVariable}
                        />
                    </div>
                </div>
            </Drawer.Content>
            {variables.length > 0 ? (
                <TestRequestModalWithInputs
                    nodeId={nodeInEdition.id}
                    isOpen={isTestRequestModalOpen}
                    onClose={() => {
                        setIsTestRequestModalOpen(false)
                    }}
                    isLoading={isTestRequestLoading}
                    sendTestRequest={sendTestRequest}
                    onReset={() => {
                        dispatch({
                            type: 'RESET_HTTP_REQUEST_TEST_REQUEST_RESULT',
                            httpRequestNodeId: nodeInEdition.id,
                        })
                    }}
                    variablesInChildren={variablesInUse}
                    variables={nodeInEdition.data.variables}
                    result={nodeInEdition.data.testRequestResult}
                    inputs={variables.filter(
                        (variable): variable is WorkflowVariable =>
                            variable != null
                    )}
                    onChangeVariable={handleChangeVariable}
                    onDeleteVariable={handleDeleteVariable}
                    onAddVariable={handleAddVariable}
                />
            ) : (
                nodeInEdition.data.testRequestResult && (
                    <TestRequestModal
                        isOpen={isTestRequestModalOpen}
                        onClose={() => {
                            setIsTestRequestModalOpen(false)
                        }}
                        nodeId={nodeInEdition.id}
                        variablesInChildren={variablesInUse}
                        isLoading={isTestRequestLoading}
                        sendTestRequest={sendTestRequest}
                        variables={nodeInEdition.data.variables}
                        result={nodeInEdition.data.testRequestResult}
                        onChangeVariable={handleChangeVariable}
                        onDeleteVariable={handleDeleteVariable}
                        onAddVariable={handleAddVariable}
                    />
                )
            )}
        </>
    )
}
