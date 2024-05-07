import React, {ReactNode} from 'react'

import Tooltip from 'pages/common/components/Tooltip'
import {Drawer} from 'pages/common/components/Drawer'
import IconButton from 'pages/common/components/button/IconButton'
import useId from 'hooks/useId'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'

import css from './NodeEditorDrawer.less'

type Props = {
    label?: string
    onClose: () => void
    children?: ReactNode
    isPreview?: boolean
}

const EditorDrawerHeader = ({onClose, children, label, isPreview}: Props) => {
    const closeButtonId = `${
        isPreview ? 'preview-' : ''
    }close-button-${useId()}`

    return (
        <Drawer.Header className={css.header}>
            <div className={css.headerTop}>
                {label && <h3>{label}</h3>}
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

export default EditorDrawerHeader
