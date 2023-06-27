import React from 'react'
import classNames from 'classnames'
import {Drawer} from 'pages/common/components/Drawer'
import IconButton from 'pages/common/components/button/IconButton'
import {VisualBuilderNode} from '../../models/visualBuilderGraph.types'

import css from './NodeEditorDrawer.less'
import TriggerButtonEditor from './editors/TriggerButtonEditor'
import MultipleChoicesEditor from './editors/MultipleChoicesEditor'
import AutomatedMessageEditor from './editors/AutomatedMessageEditor'

type NodeEditorDrawerProps = {
    nodeInEdition: VisualBuilderNode | null
    open: boolean
    onClose: () => void
}

// allow to edit trigger button, automated message and reply button in a right-side panel
export default function NodeEditorDrawer({
    nodeInEdition,
    open,
    onClose,
}: NodeEditorDrawerProps) {
    return (
        <Drawer
            className={classNames(css.drawer, {
                [css.drawerWide]:
                    nodeInEdition?.type === 'automated_message' ||
                    nodeInEdition?.type === 'multiple_choices',
            })}
            name="visual-builder-node-edition"
            open={open}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            onBackdropClick={() => onClose()}
            transitionDurationMs={300}
            disableBackdropOpacity
        >
            <Drawer.Header className={css.header}>
                <div className={css.headerTop}>
                    <Drawer.HeaderActions>
                        <IconButton
                            onClick={() => onClose()}
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="close edit modal"
                            data-testid="close-drawer"
                        >
                            keyboard_tab
                        </IconButton>
                    </Drawer.HeaderActions>
                </div>
            </Drawer.Header>
            <Drawer.Content>
                {nodeInEdition?.type === 'trigger_button' && (
                    <TriggerButtonEditor
                        nodeInEdition={nodeInEdition}
                        onClose={onClose}
                    />
                )}
                {nodeInEdition?.type === 'automated_message' && (
                    <AutomatedMessageEditor nodeInEdition={nodeInEdition} />
                )}
                {nodeInEdition?.type === 'multiple_choices' && (
                    <MultipleChoicesEditor
                        nodeInEdition={nodeInEdition}
                        onClose={onClose}
                    />
                )}
            </Drawer.Content>
        </Drawer>
    )
}
