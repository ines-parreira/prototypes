import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useId } from '@repo/hooks'
import { produce } from 'immer'
import _uniq from 'lodash/uniq'

import {
    LegacyButton as Button,
    Label,
    ToggleField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useDownloadWorkflowConfigurationStepLogs } from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    extractVariablesFromNode,
    parseWorkflowVariable,
} from 'pages/automate/workflows/models/variables.model'
import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import {
    getHTTPRequestNodeErrors,
    getHTTPRequestNodeTouched,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { HttpRequestNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { saveFileAsDownloaded } from 'utils/file'

import TextareaWithVariables from '../../components/variables/TextareaWithVariables'
import TextInputWithVariables from '../../components/variables/TextInputWithVariables'
import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'
import BodyContentTypeSelect from './BodyContentTypeSelect'
import FormUrlencoded from './FormUrlencoded'
import Headers from './Headers'
import MethodSelect from './MethodSelect'
import Outputs from './Outputs'
import TestRequestModal from './TestRequestModal'
import TestRequestModalWithInputs from './TestRequestModalWithInputs'
import useSendTestRequest from './useSendTestRequest'
import Variables from './Variables'

import css from '../NodeEditor.less'

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
        getVariableListInChildren,
        getVariableListForNode,
    } = useVisualBuilderContext()
    const { isLoading: isTestRequestLoading, sendTestRequest } =
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
        [getVariableListInChildren, nodeInEdition.id],
    )
    const appDispatch = useAppDispatch()

    const { actionsApps } = useApps()
    const selectedApp = useMemo(() => {
        if (visualBuilderGraph.apps?.[0]?.type === 'app') {
            const appId = visualBuilderGraph.apps?.[0]?.app_id
            return actionsApps.find((app) => app.id === appId)
        }
    }, [actionsApps, visualBuilderGraph.apps])

    const appType = visualBuilderGraph.apps?.[0]?.type
    const isNativeApp = appType === 'shopify' || appType === 'recharge'
    const useServiceConnection = !!nodeInEdition.data.serviceConnectionSettings

    const { mutateAsync: downloadEventLogs, isLoading: isDownloadPending } =
        useDownloadWorkflowConfigurationStepLogs()
    const handleDownloadHttpRequestEventLogs = useCallback(async () => {
        try {
            const { data } = await downloadEventLogs([
                {
                    internal_id: visualBuilderGraph.internal_id,
                    step_id: nodeInEdition.id,
                },
            ])

            saveFileAsDownloaded(
                `${
                    nodeInEdition.data.name ?? 'Request name'
                }-event-logs-${new Date().toISOString()}.csv`,
                data,
                'text/csv',
            )
        } catch {
            void appDispatch(
                notify({
                    message: 'Failed to download event logs.',
                    allowHTML: true,
                    showDismissButton: true,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [
        downloadEventLogs,
        visualBuilderGraph.internal_id,
        appDispatch,
        nodeInEdition.id,
        nodeInEdition.data.name,
    ])
    const downloadLogsButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        inputRef?.focus({ preventScroll: true })
    }, [inputRef])

    const isNodeNew = useMemo(
        () => checkNewVisualBuilderNode(nodeInEdition.id),
        [nodeInEdition.id, checkNewVisualBuilderNode],
    )
    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )
    const variables = useMemo(() => {
        const variables = _uniq(
            extractVariablesFromNode({
                type: 'http_request',
                data: nodeInEdition.data,
            }),
        )
        return variables.map((variable) =>
            parseWorkflowVariable(variable, workflowVariables),
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
        [dispatch, nodeInEdition.id],
    )
    const handleChangeVariable = useCallback(
        (
            index: number,
            variable: HttpRequestNodeType['data']['variables'][number],
        ) => {
            dispatch({
                type: 'SET_HTTP_REQUEST_VARIABLE',
                httpRequestNodeId: nodeInEdition.id,
                index,
                variable,
            })
        },
        [dispatch, nodeInEdition.id],
    )

    const triggerNode = visualBuilderGraph.nodes[0]
    const errors = useMemo(
        () =>
            getHTTPRequestNodeErrors(
                produce(nodeInEdition, (draft) => {
                    draft.data.touched = getHTTPRequestNodeTouched(draft)
                }),
                workflowVariables,
            ),
        [nodeInEdition, workflowVariables],
    )

    const oauth2ToggleId = `oauth2-toggle-${useId()}`

    const sendTestRequestWithPersistence = useCallback(
        async (
            variables?: Record<string, string>,
            refreshToken?: string,
            refreshTokenUrl?: string,
        ) => {
            // Store the inputs in the node data if provided
            if (variables) {
                dispatch({
                    type: 'SET_HTTP_REQUEST_TEST_REQUEST_INPUTS',
                    httpRequestNodeId: nodeInEdition.id,
                    inputs: variables,
                    refreshToken,
                })
            }

            // Send the actual test request
            return sendTestRequest(variables, refreshToken, refreshTokenUrl)
        },
        [dispatch, nodeInEdition.id, sendTestRequest],
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition}>
                {triggerNode.type === 'channel_trigger' && (
                    <>
                        <Button
                            ref={downloadLogsButtonRef}
                            fillStyle="ghost"
                            intent="secondary"
                            isLoading={isDownloadPending}
                            isDisabled={isNodeNew}
                            onClick={() => {
                                void handleDownloadHttpRequestEventLogs()
                            }}
                            leadingIcon="download"
                        >
                            Download Event logs
                        </Button>
                        {isNodeNew && (
                            <Tooltip target={downloadLogsButtonRef}>
                                Save this flow in order to download event logs.
                            </Tooltip>
                        )}
                    </>
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
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        name: true,
                                    },
                                })
                            }}
                            hasError={!!nodeInEdition.data.errors?.name}
                        />
                    </div>
                    {isNativeApp && visualBuilderGraph.isTemplate && (
                        <ToggleField
                            onChange={() => {
                                dispatch({
                                    type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
                                    httpRequestNodeId: nodeInEdition.id,
                                })
                            }}
                            value={useServiceConnection}
                            label="Use service connection"
                        />
                    )}
                    <div className={css.urlMethodFormFieldGroup}>
                        <div className={css.formField}>
                            <Label isRequired>
                                {useServiceConnection ? 'Path' : 'URL'}
                            </Label>
                            <TextInputWithVariables
                                value={
                                    useServiceConnection
                                        ? (nodeInEdition.data
                                              .serviceConnectionSettings
                                              ?.path ?? '')
                                        : nodeInEdition.data.url
                                }
                                onChange={(value: string) => {
                                    if (useServiceConnection) {
                                        dispatch({
                                            type: 'SET_HTTP_REQUEST_SERVICE_CONNECTION_PATH',
                                            httpRequestNodeId: nodeInEdition.id,
                                            path: value,
                                        })
                                    } else {
                                        dispatch({
                                            type: 'SET_HTTP_REQUEST_URL',
                                            httpRequestNodeId: nodeInEdition.id,
                                            url: value,
                                        })
                                    }
                                }}
                                variables={workflowVariables}
                                error={nodeInEdition.data.errors?.url}
                                onBlur={() => {
                                    dispatch({
                                        type: 'SET_TOUCHED',
                                        nodeId: nodeInEdition.id,
                                        touched: {
                                            url: true,
                                        },
                                    })
                                }}
                                allowFilters={
                                    triggerNode.type === 'llm_prompt_trigger' ||
                                    triggerNode.type ===
                                        'reusable_llm_prompt_trigger'
                                }
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
                        <div className={css.headersHeading}>
                            <Label>Headers</Label>
                            {selectedApp?.auth_type === 'oauth2-token' &&
                                visualBuilderGraph.isTemplate && (
                                    <div id={oauth2ToggleId}>
                                        <ToggleField
                                            onChange={() => {
                                                dispatch({
                                                    type: 'TOGGLE_OAUTH2_SETTINGS',
                                                    httpRequestNodeId:
                                                        nodeInEdition.id,
                                                })
                                            }}
                                            value={
                                                !!nodeInEdition.data
                                                    .oauth2TokenSettings
                                            }
                                            label="Enable OAuth2 Authentication"
                                        />
                                        <Tooltip
                                            placement="top-start"
                                            target={oauth2ToggleId}
                                            autohide={false}
                                        >
                                            {`Enabling this will override any existing 'Authorization' key and apply a 'Bearer' prefix to the authorization token.`}
                                        </Tooltip>
                                    </div>
                                )}
                            {selectedApp?.auth_type === 'trackstar' &&
                                visualBuilderGraph.isTemplate && (
                                    <ToggleField
                                        onChange={() => {
                                            dispatch({
                                                type: 'TOGGLE_TRACKSTAR_AUTH_SETTINGS',
                                                httpRequestNodeId:
                                                    nodeInEdition.id,
                                            })
                                        }}
                                        value={
                                            !!nodeInEdition.data
                                                .trackstar_integration_name
                                        }
                                        label="Enable Trackstar Auth"
                                    />
                                )}
                        </div>
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
                            errors={nodeInEdition.data.errors?.headers}
                            onNameBlur={(index) => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        headers: {
                                            [index]: {
                                                name: true,
                                            },
                                        },
                                    },
                                })
                            }}
                            onValueBlur={(index) => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        headers: {
                                            [index]: {
                                                value: true,
                                            },
                                        },
                                    },
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
                                    error={nodeInEdition.data.errors?.json}
                                    allowFilters={
                                        triggerNode.type ===
                                            'llm_prompt_trigger' ||
                                        triggerNode.type ===
                                            'reusable_llm_prompt_trigger'
                                    }
                                    onBlur={() => {
                                        dispatch({
                                            type: 'SET_TOUCHED',
                                            nodeId: nodeInEdition.id,
                                            touched: {
                                                json: true,
                                            },
                                        })
                                    }}
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
                                    errors={
                                        nodeInEdition.data.errors
                                            ?.formUrlencoded
                                    }
                                    onKeyBlur={(index) => {
                                        dispatch({
                                            type: 'SET_TOUCHED',
                                            nodeId: nodeInEdition.id,
                                            touched: {
                                                formUrlencoded: {
                                                    [index]: {
                                                        key: true,
                                                    },
                                                },
                                            },
                                        })
                                    }}
                                    onValueBlur={(index) => {
                                        dispatch({
                                            type: 'SET_TOUCHED',
                                            nodeId: nodeInEdition.id,
                                            touched: {
                                                formUrlencoded: {
                                                    [index]: {
                                                        value: true,
                                                    },
                                                },
                                            },
                                        })
                                    }}
                                />
                            )}
                        </div>
                    )}
                    <Button
                        className={css.testRequestButton}
                        isLoading={isTestRequestLoading}
                        isDisabled={
                            !!errors?.url ||
                            !!errors?.headers ||
                            !!errors?.json ||
                            !!errors?.formUrlencoded
                        }
                        onClick={() => {
                            if (
                                !variables.length &&
                                !nodeInEdition.data.testRequestResult &&
                                !nodeInEdition.data.oauth2TokenSettings
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
                        <div>
                            <Label>Output variables</Label>
                            <Caption>
                                Create variables from the request response which
                                can be used in subsequent steps
                            </Caption>
                        </div>
                        <Variables
                            nodeId={nodeInEdition.id}
                            variables={nodeInEdition.data.variables}
                            variablesInChildren={variablesInUse}
                            onChange={handleChangeVariable}
                            onDelete={handleDeleteVariable}
                            onAdd={handleAddVariable}
                            errors={nodeInEdition.data.errors?.variables}
                            onNameBlur={(index) => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        variables: {
                                            [index]: {
                                                name: true,
                                            },
                                        },
                                    },
                                })
                            }}
                            onJSONPathBlur={(index) => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        variables: {
                                            [index]: {
                                                jsonpath: true,
                                            },
                                        },
                                    },
                                })
                            }}
                        />
                    </div>
                    {(triggerNode.type === 'llm_prompt_trigger' ||
                        triggerNode.type === 'reusable_llm_prompt_trigger') && (
                        <div className={css.formField}>
                            <Label>
                                {triggerNode.type === 'llm_prompt_trigger'
                                    ? 'Request results explanation for AI Agent (optional)'
                                    : 'Action output variables (optional)'}
                            </Label>
                            <Outputs
                                nodeId={nodeInEdition.id}
                                outputs={nodeInEdition.data.outputs}
                                variables={nodeInEdition.data.variables}
                                onChange={(index, output) => {
                                    dispatch({
                                        type: 'SET_HTTP_REQUEST_OUTPUT',
                                        httpRequestNodeId: nodeInEdition.id,
                                        index,
                                        output,
                                    })
                                }}
                                onDelete={(index) => {
                                    dispatch({
                                        type: 'DELETE_HTTP_REQUEST_OUTPUT',
                                        httpRequestNodeId: nodeInEdition.id,
                                        index,
                                    })
                                }}
                                onAdd={(variableId) => {
                                    dispatch({
                                        type: 'ADD_HTTP_REQUEST_OUTPUT',
                                        httpRequestNodeId: nodeInEdition.id,
                                        variableId,
                                    })
                                }}
                            />
                        </div>
                    )}
                </div>
            </Drawer.Content>
            {variables.length || nodeInEdition.data.oauth2TokenSettings ? (
                <TestRequestModalWithInputs
                    nodeId={nodeInEdition.id}
                    isOpen={isTestRequestModalOpen}
                    refreshTokenUrl={
                        (!!nodeInEdition.data.oauth2TokenSettings &&
                            selectedApp?.auth_settings &&
                            'refresh_token_url' in selectedApp.auth_settings &&
                            selectedApp?.auth_settings.refresh_token_url) ||
                        undefined
                    }
                    onClose={() => {
                        setIsTestRequestModalOpen(false)
                    }}
                    isLoading={isTestRequestLoading}
                    sendTestRequest={sendTestRequestWithPersistence}
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
                            variable != null,
                    )}
                    initialValues={nodeInEdition.data.testRequestInputs}
                    initialRefreshToken={
                        nodeInEdition.data.testRequestRefreshToken
                    }
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
                        sendTestRequest={sendTestRequestWithPersistence}
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
