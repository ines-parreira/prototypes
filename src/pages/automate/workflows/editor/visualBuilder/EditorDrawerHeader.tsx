import React, { ReactNode } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import IconButton from 'pages/common/components/button/IconButton'
import { Drawer } from 'pages/common/components/Drawer'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'

import css from './NodeEditorDrawer.less'

type Props = {
    label?: string
    onClose: () => void
    children?: ReactNode
    isPreview?: boolean
    headerSaperator?: boolean
    testId: string
    className?: string
}

const EditorDrawerHeader = ({
    onClose,
    children,
    label,
    isPreview,
    headerSaperator,
    testId,
    className,
}: Props) => {
    const closeButtonId = `${
        isPreview ? 'preview-' : ''
    }close-button-${useId()}`

    return (
        <Drawer.Header
            className={classNames(css.header, className, {
                [css.headerSaperator]: headerSaperator,
            })}
        >
            <div className={css.headerTop}>
                {label && <h3 title={label}>{label}</h3>}
                <Drawer.HeaderActions>
                    {children}
                    <IconButton
                        id={closeButtonId}
                        onClick={() => onClose()}
                        fillStyle="ghost"
                        intent="secondary"
                        size="medium"
                        aria-label="close edit modal"
                        data-testid={`${testId}-close-drawer`} // used in e2e tests
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
