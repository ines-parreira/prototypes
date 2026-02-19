import React from 'react'

import { act, fireEvent, screen } from '@testing-library/react'

import { useDownloadWorkflowConfigurationStepLogs } from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type {
    HttpRequestNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { renderWithStore } from 'utils/testing'

import HttpRequestEditor from '../index'

jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('models/workflows/queries')

const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs,
)
const mockUseApps = jest.mocked(useApps)

mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
    mutateAsync: jest.fn(),
    isLoading: false,
} as unknown as ReturnType<typeof useDownloadWorkflowConfigurationStepLogs>)
mockUseApps.mockReturnValue({
    apps: [],
    actionsApps: [
        {
            id: 'someid1',
            auth_type: 'oauth2-token',
            auth_settings: {
                url: 'https://example.com',
                refresh_token_url: '',
            },
        },
    ],
    isLoading: false,
})

describe('<HttpRequestEditor />', () => {
    it('should dispatch TOGGLE_OAUTH2_SETTINGS', () => {
        const nodeInEdition: HttpRequestNodeType = {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: '',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [],
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'channel_trigger1',
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                nodeInEdition,
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'channel_trigger1',
                    target: 'http_request1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: true,
            apps: [
                {
                    app_id: 'someid1',
                    type: 'app',
                },
            ],
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <HttpRequestEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable OAuth2 Authentication'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'TOGGLE_OAUTH2_SETTINGS',
            httpRequestNodeId: nodeInEdition.id,
        })
    })

    it('should show service connection toggle for shopify app', () => {
        const nodeInEdition: HttpRequestNodeType = {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: '',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [],
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'channel_trigger1',
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                nodeInEdition,
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'channel_trigger1',
                    target: 'http_request1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: true,
            apps: [
                {
                    type: 'shopify',
                },
            ],
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <HttpRequestEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        expect(screen.getByText('Use service connection')).toBeInTheDocument()
        expect(screen.getByText('URL')).toBeInTheDocument()
    })

    it('should dispatch TOGGLE_SERVICE_CONNECTION_SETTINGS for native app', () => {
        const nodeInEdition: HttpRequestNodeType = {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: '',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [],
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'channel_trigger1',
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                nodeInEdition,
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'channel_trigger1',
                    target: 'http_request1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: true,
            apps: [
                {
                    type: 'shopify',
                },
            ],
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <HttpRequestEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        act(() => {
            fireEvent.click(screen.getByText('Use service connection'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: nodeInEdition.id,
        })
    })

    it('should show Path label when service connection is enabled', () => {
        const nodeInEdition: HttpRequestNodeType = {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: '',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [],
                serviceConnectionSettings: {
                    integration_id: '{{store.helpdesk_integration_id}}',
                    path: '/admin/api/2025-01/orders.json',
                },
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'channel_trigger1',
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                nodeInEdition,
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'channel_trigger1',
                    target: 'http_request1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: true,
            apps: [
                {
                    type: 'shopify',
                },
            ],
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <HttpRequestEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        expect(screen.getByText('Path')).toBeInTheDocument()
        expect(screen.queryByText('URL')).not.toBeInTheDocument()
    })

    it('should not show service connection toggle for custom app', () => {
        const nodeInEdition: HttpRequestNodeType = {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: '',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [],
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'channel_trigger1',
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                nodeInEdition,
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'channel_trigger1',
                    target: 'http_request1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: true,
            apps: [
                {
                    app_id: 'someid1',
                    type: 'app',
                },
            ],
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <HttpRequestEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        expect(
            screen.queryByText('Use service connection'),
        ).not.toBeInTheDocument()
    })

    it('should dispatch TOGGLE_TRACKSTAR_AUTH_SETTINGS', () => {
        mockUseApps.mockReturnValue({
            apps: [],
            actionsApps: [
                {
                    id: 'someid1',
                    auth_type: 'trackstar',
                    auth_settings: {
                        integration_name: 'sandbox',
                    },
                },
            ],
            isLoading: false,
        })
        const nodeInEdition: HttpRequestNodeType = {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: '',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [],
            },
        }

        const mockGetVariableListForNode = jest.fn().mockReturnValue([])
        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'channel_trigger1',
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                nodeInEdition,
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'channel_trigger1',
                    target: 'http_request1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: true,
            apps: [
                {
                    app_id: 'someid1',
                    type: 'app',
                },
            ],
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: mockGetVariableListForNode,
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <HttpRequestEditor nodeInEdition={nodeInEdition} />
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable Trackstar Auth'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'TOGGLE_TRACKSTAR_AUTH_SETTINGS',
            httpRequestNodeId: nodeInEdition.id,
        })
    })
})
