import React, {ReactNode} from 'react'

import Tooltip from 'pages/common/components/Tooltip'
import {Drawer} from 'pages/common/components/Drawer'
import IconButton from 'pages/common/components/button/IconButton'
import useId from 'hooks/useId'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {labelByVisualBuilderNodeType} from '../../constants'
import {useNodeEditorDrawerContext} from './NodeEditorDrawerContext'

import css from './NodeEditorDrawer.less'

type Props = {
    nodeInEdition: VisualBuilderNode
    children?: ReactNode
}

const NodeEditorDrawerHeader = ({nodeInEdition, children}: Props) => {
    const {onClose} = useNodeEditorDrawerContext()

    const closeButtonId = `close-button-${useId()}`

    return (
        <Drawer.Header className={css.header}>
            <div className={css.headerTop}>
                <h3>
                    {nodeInEdition.type &&
                        labelByVisualBuilderNodeType[nodeInEdition.type]}
                </h3>
                <Drawer.HeaderActions>
                    {children}
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
                    <Tooltip placement="bottom-end" target={closeButtonId}>
                        <div className={css.closeButtonTooltip}>
                            <span>Close side panel</span>
                            <ShortcutIcon type="dark">esc</ShortcutIcon>
                        </div>
                    </Tooltip>
                </Drawer.HeaderActions>
            </div>
        </Drawer.Header>
    )
}

export default NodeEditorDrawerHeader
