import React from 'react'

import { act, screen } from '@testing-library/react'

import {
    createSelfServiceStoreIntegrationContextForPreview,
    StoreIntegrationContext,
} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { TranslationsPreviewContext } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { WorkflowChannelSupportContext } from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    EndNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { renderWithStore } from 'utils/testing'

import EndNodeEditor from '..'

describe('<EndNodeEditor />', () => {
    const mockNodeInEdition: EndNodeType = {
        ...buildNodeCommonProperties(),
        id: 'end_node1',
        type: 'end',
        data: {
            action: 'end',
            ticketTags: [],
            ticketAssigneeUserId: null,
            ticketAssigneeTeamId: null,
        },
    }

    const mockGraph: VisualBuilderGraph = {
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
            mockNodeInEdition,
        ],
        edges: [
            {
                ...buildEdgeCommonProperties(),
                source: 'channel_trigger1',
                target: 'end_node1',
            },
        ],
        available_languages: [],
        nodeEditingId: null,
        choiceEventIdEditing: null,
        branchIdsEditing: [],
        isTemplate: false,
    }

    const mockDispatch = jest.fn()

    const renderComponent = () =>
        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: mockGraph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    initialVisualBuilderGraph: mockGraph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <StoreIntegrationContext.Provider
                        value={createSelfServiceStoreIntegrationContextForPreview()}
                    >
                        <WorkflowChannelSupportContext.Provider
                            value={{
                                isStepUnsupportedInAllChannels: jest.fn(),
                                getUnsupportedConnectedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getSupportedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getUnsupportedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getUnsupportedNodeTypes: jest
                                    .fn()
                                    .mockReturnValue([]),
                            }}
                        >
                            <TranslationsPreviewContext.Provider
                                value={{
                                    previewLanguageList: [],
                                    previewLanguage: null,
                                    setPreviewLanguage: jest.fn(),
                                    translatedGraph: mockGraph,
                                }}
                            >
                                <EndNodeEditor
                                    nodeInEdition={mockNodeInEdition}
                                />
                            </TranslationsPreviewContext.Provider>
                        </WorkflowChannelSupportContext.Provider>
                    </StoreIntegrationContext.Provider>
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the end node editor with correct action options for channel trigger', () => {
        renderComponent()
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('End')).toBeInTheDocument()
    })

    it('should handle action change', () => {
        renderComponent()
        const actionSelect = screen.getByRole('combobox')

        act(() => {
            actionSelect.focus()
        })
        screen.getByText('Create ticket').click()

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_END_NODE_SETTINGS',
            endNodeId: mockNodeInEdition.id,
            settings: {
                action: 'create-ticket',
                ticketTags: [],
                ticketAssigneeUserId: null,
                ticketAssigneeTeamId: null,
            },
        })
    })

    it('should show ticket creation options when action is create-ticket', () => {
        const nodeWithCreateTicket: EndNodeType = {
            ...mockNodeInEdition,
            data: {
                ...mockNodeInEdition.data,
                action: 'create-ticket',
            },
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: mockGraph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    initialVisualBuilderGraph: mockGraph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <StoreIntegrationContext.Provider
                        value={createSelfServiceStoreIntegrationContextForPreview()}
                    >
                        <WorkflowChannelSupportContext.Provider
                            value={{
                                isStepUnsupportedInAllChannels: jest.fn(),
                                getUnsupportedConnectedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getSupportedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getUnsupportedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getUnsupportedNodeTypes: jest
                                    .fn()
                                    .mockReturnValue([]),
                            }}
                        >
                            <TranslationsPreviewContext.Provider
                                value={{
                                    previewLanguageList: [],
                                    previewLanguage: null,
                                    setPreviewLanguage: jest.fn(),
                                    translatedGraph: mockGraph,
                                }}
                            >
                                <EndNodeEditor
                                    nodeInEdition={nodeWithCreateTicket}
                                />
                            </TranslationsPreviewContext.Provider>
                        </WorkflowChannelSupportContext.Provider>
                    </StoreIntegrationContext.Provider>
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        expect(screen.getByText('When ticket is created')).toBeInTheDocument()
    })

    it('should show feedback options when action is ask-for-feedback', () => {
        const nodeWithFeedback: EndNodeType = {
            ...mockNodeInEdition,
            data: {
                ...mockNodeInEdition.data,
                action: 'ask-for-feedback',
            },
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: mockGraph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    initialVisualBuilderGraph: mockGraph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <StoreIntegrationContext.Provider
                        value={createSelfServiceStoreIntegrationContextForPreview()}
                    >
                        <WorkflowChannelSupportContext.Provider
                            value={{
                                isStepUnsupportedInAllChannels: jest.fn(),
                                getUnsupportedConnectedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getSupportedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getUnsupportedChannels: jest
                                    .fn()
                                    .mockReturnValue([]),
                                getUnsupportedNodeTypes: jest
                                    .fn()
                                    .mockReturnValue([]),
                            }}
                        >
                            <TranslationsPreviewContext.Provider
                                value={{
                                    previewLanguageList: [],
                                    previewLanguage: null,
                                    setPreviewLanguage: jest.fn(),
                                    translatedGraph: mockGraph,
                                }}
                            >
                                <EndNodeEditor
                                    nodeInEdition={nodeWithFeedback}
                                />
                            </TranslationsPreviewContext.Provider>
                        </WorkflowChannelSupportContext.Provider>
                    </StoreIntegrationContext.Provider>
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        expect(screen.getByText('If ticket is created')).toBeInTheDocument()
        expect(
            screen.getByText(/Customers will be asked for feedback/),
        ).toBeInTheDocument()
    })
})
