import React, {useEffect, useMemo, useRef} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useKey} from 'react-use'
import classNames from 'classnames'
import _camelCase from 'lodash/camelCase'

import {Drawer} from 'pages/common/components/Drawer'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {TranslationsPreviewProvider} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import usePrevious from 'hooks/usePrevious'

import css from './NodeEditorDrawer.less'
import TriggerButtonEditor from './editors/TriggerButtonEditor'
import MultipleChoicesEditor from './editors/MultipleChoicesEditor'
import AutomatedMessageEditor from './editors/AutomatedMessageEditor'
import TextReplyEditor from './editors/TextReplyEditor'
import FileUploadEditor from './editors/FileUploadEditor'
import EndNodeEditor from './editors/EndNodeEditor'
import OrderSelectionEditor from './editors/OrderSelectionEditor'
import HttpRequestEditor from './editors/HttpRequestEditor'
import NodeEditorDrawerContext, {
    NodeEditorDrawerContextType,
} from './NodeEditorDrawerContext'

type Props = {
    nodeInEdition?: VisualBuilderNode | null
    onClose: () => void
}

const NodeEditorDrawer = ({nodeInEdition, onClose}: Props) => {
    const memoizedNodeInEditionRef = useRef(nodeInEdition)
    const prevNodeInEdition = usePrevious(nodeInEdition)

    if (nodeInEdition) {
        memoizedNodeInEditionRef.current = nodeInEdition
    }

    useEffect(() => {
        if (prevNodeInEdition && !nodeInEdition) {
            onClose()
        }
    }, [prevNodeInEdition, nodeInEdition, onClose])
    useKey(
        'Escape',
        () => {
            if (nodeInEdition) {
                onClose()
            }
        },
        undefined,
        [nodeInEdition, onClose]
    )

    const memoizedNodeInEdition = memoizedNodeInEditionRef.current

    const contextValue = useMemo<NodeEditorDrawerContextType>(
        () => ({onClose}),
        [onClose]
    )

    return (
        <Drawer
            className={classNames(
                css.drawer,
                memoizedNodeInEdition
                    ? css[_camelCase(memoizedNodeInEdition.type)]
                    : undefined
            )}
            name="visual-builder-node-edition"
            open={!!nodeInEdition}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
        >
            <NodeEditorDrawerContext.Provider value={contextValue}>
                <TranslationsPreviewProvider key={nodeInEdition?.id}>
                    {memoizedNodeInEdition?.type === 'trigger_button' && (
                        <TriggerButtonEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'automated_message' && (
                        <AutomatedMessageEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'multiple_choices' && (
                        <MultipleChoicesEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'text_reply' && (
                        <TextReplyEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'file_upload' && (
                        <FileUploadEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'order_selection' && (
                        <OrderSelectionEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'http_request' && (
                        <HttpRequestEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    )}
                    {memoizedNodeInEdition?.type === 'end' && (
                        <EndNodeEditor nodeInEdition={memoizedNodeInEdition} />
                    )}
                </TranslationsPreviewProvider>
            </NodeEditorDrawerContext.Provider>
        </Drawer>
    )
}

export default NodeEditorDrawer
