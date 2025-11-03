import React from 'react'

import { act, fireEvent } from '@testing-library/react'

import {
    createSelfServiceStoreIntegrationContextForPreview,
    StoreIntegrationContext,
} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { TranslationsPreviewContext } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { renderWithStore } from 'utils/testing'

import AutomatedMessageEditor from '../AutomatedMessageEditor'

describe('<AutomatedMessageEditor />', () => {
    it('should dispatch SET_TOUCHED', () => {
        const nodeInEdition: AutomatedMessageNodeType = {
            ...buildNodeCommonProperties(),
            id: 'automated_message1',
            type: 'automated_message',
            data: {
                content: {
                    html: '<div><br /></div>',
                    text: '',
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
                    target: 'automated_message1',
                },
            ],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: false,
        }

        const { container } = renderWithStore(
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
                    <StoreIntegrationContext.Provider
                        value={createSelfServiceStoreIntegrationContextForPreview()}
                    >
                        <TranslationsPreviewContext.Provider
                            value={{
                                previewLanguageList: [],
                                previewLanguage: null,
                                setPreviewLanguage: jest.fn(),
                                translatedGraph: graph,
                            }}
                        >
                            <AutomatedMessageEditor
                                nodeInEdition={nodeInEdition}
                            />
                        </TranslationsPreviewContext.Provider>
                    </StoreIntegrationContext.Provider>
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        act(() => {
            const editor = container.querySelectorAll(
                '.public-DraftEditor-content',
            )[0]

            fireEvent.focus(editor)
            fireEvent.blur(editor)
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                content: true,
            },
        })

        expect(mockGetVariableListForNode).toHaveBeenCalledWith(
            nodeInEdition.id,
        )
    })
})
