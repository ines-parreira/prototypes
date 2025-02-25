import React from 'react'

import { act, fireEvent, screen } from '@testing-library/react'

import NodeEditorDrawerContext from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext'
import { TranslationsPreviewContext } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { buildNodeCommonProperties } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    ChannelTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { renderWithStore } from 'utils/testing'

import ChannelTriggerEditor from '../ChannelTriggerEditor'

describe('<ChannelTriggerEditor />', () => {
    it('should dispatch SET_TOUCHED', () => {
        const nodeInEdition: ChannelTriggerNodeType = {
            ...buildNodeCommonProperties(),
            id: 'channel_trigger1',
            type: 'channel_trigger',
            data: {
                label: '',
                label_tkey: '',
            },
        }

        const mockDispatch = jest.fn()
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            name: '',
            nodes: [nodeInEdition],
            edges: [],
            available_languages: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: false,
        }

        renderWithStore(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    initialVisualBuilderGraph: graph,
                    isNew: false,
                }}
            >
                <NodeEditorDrawerContext.Provider
                    value={{ onClose: jest.fn() }}
                >
                    <TranslationsPreviewContext.Provider
                        value={{
                            previewLanguageList: [],
                            previewLanguage: null,
                            setPreviewLanguage: jest.fn(),
                            translatedGraph: graph,
                        }}
                    >
                        <ChannelTriggerEditor nodeInEdition={nodeInEdition} />
                    </TranslationsPreviewContext.Provider>
                </NodeEditorDrawerContext.Provider>
            </VisualBuilderContext.Provider>,
            {},
        )

        act(() => {
            fireEvent.blur(screen.getByRole('textbox'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_TOUCHED',
            nodeId: nodeInEdition.id,
            touched: {
                label: true,
            },
        })
    })
})
