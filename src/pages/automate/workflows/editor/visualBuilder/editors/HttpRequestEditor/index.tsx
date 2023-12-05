import React, {useEffect, useMemo, useState} from 'react'
import _uniq from 'lodash/uniq'

import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {
    extractVariablesFromNode,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
} from 'pages/automate/workflows/models/variables.model'
import {validateJSON} from 'utils'
import {Drawer} from 'pages/common/components/Drawer'
import Button from 'pages/common/components/button/Button'
import useIsHttpRequestNodeErrored from 'pages/automate/workflows/hooks/useIsHttpRequestNodeErrored'

import TextInputWithVariables from '../../components/variables/TextInputWithVariables'
import TextareaWithVariables from '../../components/variables/TextareaWithVariables'
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
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const {isErrored} = useIsHttpRequestNodeErrored(nodeInEdition)
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

    useEffect(() => {
        inputRef?.focus({preventScroll: true})
    }, [inputRef])

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

    return (
        <>
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
                                        validateJSON(
                                            nodeInEdition.data.json ?? ''
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
                    <div className={css.divider} />
                    <div className={css.formField}>
                        <Label>Create variables</Label>
                        <Variables
                            variables={nodeInEdition.data.variables}
                            onChange={(index, variable) => {
                                dispatch({
                                    type: 'SET_HTTP_REQUEST_VARIABLE',
                                    httpRequestNodeId: nodeInEdition.id,
                                    index,
                                    variable,
                                })
                            }}
                            onDelete={(index) => {
                                dispatch({
                                    type: 'DELETE_HTTP_REQUEST_VARIABLE',
                                    httpRequestNodeId: nodeInEdition.id,
                                    index,
                                })
                            }}
                            onAdd={() => {
                                dispatch({
                                    type: 'ADD_HTTP_REQUEST_VARIABLE',
                                    httpRequestNodeId: nodeInEdition.id,
                                })
                            }}
                        />
                    </div>
                </div>
            </Drawer.Content>
            <Drawer.Footer>
                <Button
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
                >
                    {nodeInEdition.data.testRequestResult
                        ? 'View Test Results'
                        : 'Test request'}
                </Button>
                {variables.length > 0 ? (
                    <TestRequestModalWithInputs
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
                        variables={nodeInEdition.data.variables}
                        result={nodeInEdition.data.testRequestResult}
                        inputs={variables}
                    />
                ) : (
                    nodeInEdition.data.testRequestResult && (
                        <TestRequestModal
                            isOpen={isTestRequestModalOpen}
                            onClose={() => {
                                setIsTestRequestModalOpen(false)
                            }}
                            isLoading={isTestRequestLoading}
                            sendTestRequest={sendTestRequest}
                            variables={nodeInEdition.data.variables}
                            result={nodeInEdition.data.testRequestResult}
                        />
                    )
                )}
            </Drawer.Footer>
        </>
    )
}
