import React, {useEffect, useRef} from 'react'
import {useKey, usePrevious} from 'react-use'
import classNames from 'classnames'
import Tooltip from 'pages/common/components/Tooltip'
import {Drawer} from 'pages/common/components/Drawer'
import IconButton from 'pages/common/components/button/IconButton'
import useId from 'hooks/useId'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {VisualBuilderNode} from '../../models/visualBuilderGraph.types'
import {TranslationsPreviewProvider} from '../../hooks/useTranslationsPreviewContext'

import css from './NodeEditorDrawer.less'
import TriggerButtonEditor from './editors/TriggerButtonEditor'
import MultipleChoicesEditor from './editors/MultipleChoicesEditor'
import AutomatedMessageEditor from './editors/AutomatedMessageEditor'
import TextReplyEditor from './editors/TextReplyEditor'
import FileUploadEditor from './editors/FileUploadEditor'
import EndNodeEditor from './editors/EndNodeEditor'
import OrderSelectionEditor from './editors/OrderSelectionEditor'

type NodeEditorDrawerProps = {
    nodeInEdition?: VisualBuilderNode | null
    onClose: () => void
}

// allow to edit trigger button, automated message and reply button in a right-side panel
export default function NodeEditorDrawer({
    nodeInEdition,
    onClose,
}: NodeEditorDrawerProps) {
    const closeButtonId = `close-button-${useId()}`

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

    return (
        <Drawer
            className={classNames(css.drawer)}
            name="visual-builder-node-edition"
            open={!!nodeInEdition}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
        >
            <Drawer.Header className={css.header}>
                <div className={css.headerTop}>
                    <h3>
                        {memoizedNodeInEdition?.type === 'trigger_button' &&
                            'Start flow'}
                        {memoizedNodeInEdition?.type === 'automated_message' &&
                            'Automated answer'}
                        {memoizedNodeInEdition?.type === 'multiple_choices' &&
                            'Multiple choice'}
                        {memoizedNodeInEdition?.type === 'text_reply' &&
                            'Collect text reply'}
                        {memoizedNodeInEdition?.type === 'file_upload' &&
                            'Collect file upload'}
                        {memoizedNodeInEdition?.type === 'order_selection' &&
                            'Order selection'}
                        {memoizedNodeInEdition?.type === 'end' && 'End flow'}
                    </h3>
                    <Drawer.HeaderActions>
                        <IconButton
                            id={closeButtonId}
                            onClick={() => onClose()}
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="close edit modal"
                            data-testid="close-drawer"
                        >
                            keyboard_tab
                        </IconButton>
                        {nodeInEdition && (
                            <Tooltip
                                placement="bottom-end"
                                target={closeButtonId}
                            >
                                <div className={css.closeButtonTooltip}>
                                    <span>Close side panel</span>
                                    <ShortcutIcon type="dark">esc</ShortcutIcon>
                                </div>
                            </Tooltip>
                        )}
                    </Drawer.HeaderActions>
                </div>
            </Drawer.Header>
            <Drawer.Content>
                <TranslationsPreviewProvider key={nodeInEdition?.id}>
                    {memoizedNodeInEdition?.type === 'trigger_button' && (
                        <TriggerButtonEditor
                            nodeInEdition={memoizedNodeInEdition}
                            onClose={onClose}
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
                            onClose={onClose}
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
                    {memoizedNodeInEdition?.type === 'end' && (
                        <EndNodeEditor nodeInEdition={memoizedNodeInEdition} />
                    )}
                </TranslationsPreviewProvider>
            </Drawer.Content>
        </Drawer>
    )
}
